const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const {
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "urbandictionary",
      aliases: ["urban", 'define'],
      enabled: true,
      syntax: "urban <word>",
      about: 'Lookup words on Urban Dictionary',
      example: 'urban psycho',
    });
  }
  
  async updateEmbed(message, sentMessage, entry, page) {
    const embed = new DefaultEmbed()
      .setColor("#d8d600")
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setTitle(entry.word)
      .setURL(entry.permalink)
      .setDescription(`${entry.definition}\n\n**Example**\n${entry.example}\n\n**Votes**\n👍 \`${entry.thumbs_up} / ${entry.thumbs_down}\` 👎`)
      .setFooter({
        text: `Page ${page + 1}/10 of Urban Dictionary Results`,
        iconURL: "https://avatars.githubusercontent.com/u/80348?s=280&v=4",
      });
  
    await sentMessage.edit({ embeds: [embed] });
  }

  async execute(message, args) {
    const query = args.join(" ");

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const apiUrl = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.list || data.list.length === 0) {
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `Could not find results for \`${query}\`` }, message),
        ],
      });
    }

    let currentPage = 0;
    const sentMessage = await message.channel.send("Loading definition...");
    await this.updateEmbed(message, sentMessage, data.list[currentPage], currentPage);

    const filter = (reaction, user) => {
      return ["⏪", "⏩"].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    const reactionCollector = sentMessage.createReactionCollector({ filter, time: 60000 });

    reactionCollector.on("collect", async (reaction, user) => {
      if (reaction.emoji.name === "⏩" && currentPage < 9) {
        currentPage++;
      } else if (reaction.emoji.name === "⏪" && currentPage > 0) {
        currentPage--;
      }

      await this.updateEmbed(message, sentMessage, data.list[currentPage], currentPage);
      await reaction.users.remove(user);
    });

    reactionCollector.on("end", () => {
      const backArrow = "⏪";
      const forwardArrow = "⏩";
      const backReaction = sentMessage.reactions.cache.find((r) => r.emoji.name === backArrow);
      const forwardReaction = sentMessage.reactions.cache.find((r) => r.emoji.name === forwardArrow);

      if (backReaction) {
        backReaction.users.fetch().then((users) => users.forEach((user) => backReaction.users.remove(user)));
      }
      if (forwardReaction) {
        forwardReaction.users.fetch().then((users) => users.forEach((user) => forwardReaction.users.remove(user)));
      }

    });

    if (!sentMessage.reactions.cache.find((r) => r.emoji.name === "⏪")) {
      await sentMessage.react("⏪");
    }
    if (!sentMessage.reactions.cache.find((r) => r.emoji.name === "⏩")) {
      await sentMessage.react("⏩");
    }
  }
};
