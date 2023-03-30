const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const {
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "wikihow",
      aliases: ["wh", "howto"],
      enabled: true,
      syntax: "wikihow <query>",
      about: "Lookup WikiHow articles",
      example: "wikihow tie a tie",
    });
  }

  async updateEmbed(message, sentMessage, entry, page) {
    const embed = new DefaultEmbed()
      .setColor("#FFA500")
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTitle(entry.title)
      .setURL(entry.url)
      .setImage(entry.thumbnail)
      .setDescription(entry.summary)
      .setFooter({
        text: `Page ${page + 1}/10 of WikiHow Results`,
        iconURL: "https://www.wikihow.com/images_en/thumb/b/bc/LogoNEW.png/50px-LogoNEW.png",
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

    const apiUrl = `https://hargrimm-wikihow-v1.p.rapidapi.com/articles?count=10&term=${encodeURIComponent(query)}`;

    const response = await fetch(apiUrl, {
      headers: {
        "x-rapidapi-key": "a40197c234msh1c11a88e44418bap1841bejsn494631037b10",
        "x-rapidapi-host": "hargrimm-wikihow-v1.p.rapidapi.com",
      },
    });
    const data = await response.json();

    if (!data || data.length === 0) {
      return message.reply({
        embeds: [
          new ErrorEmbed(
            { description: `Could not find results for \`${query}\`` },
            message
          ),
        ],
      });
    }

    let currentPage = 0;
    const sentMessage = await message.channel.send("Loading article...");
    await this.updateEmbed(message, sentMessage, data[currentPage], currentPage);

    const filter = (reaction, user) => {
      return ["⏪", "⏩"].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    const reactionCollector = sentMessage.createReactionCollector({
      filter,
      time: 60000,
    });

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
