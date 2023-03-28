const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { getColorFromURL } = require("color-thief-node");
const Settings = require('../../Settings/Settings');
const {
  WrongSyntaxEmbed,
  WarnEmbed,
} = require("../../../embeds");


module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "image",
      aliases: ['img'],
      enabled: true,
      syntax: "image <query>",
      about: 'Search for an image from Google',
      example: 'image cute cats',
    });
  }

  async execute(message, args) {
    
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const query = args.join(" ");
    const apiKey = process.env.GOOGLE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    const startIndex = 1;
    const settings = new Settings(this.client);
    const safeSearch = await settings.getSafeSearch(message.guild) ? 'active' : 'off';

    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&searchType=image&start=${startIndex}&safe=${safeSearch}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return message.channel.send({
        embeds: [
          new WarnEmbed({
            description:
              `No images found for **${query}**`,
          },message),
        ],
      });
    }

    let currentPage = 0;
    const maxPages = Math.min(100, data.searchInformation.totalResults);

    function getDomainName(displayLink) {
      const match = displayLink.match(/(?:www\.)?(?:\w+\.)?(\w+)(?:\.\w+)/);
      if (match && match[1]) {
        return match[1].charAt(0).toUpperCase() + match[1].slice(1);
      }
      return displayLink;
    }

    async function updateEmbed(sentMessage, page) {
      const serverSafety = await settings.getSafeSearch(message.guild);
      const item = data.items[page % data.items.length];
      const domainName = getDomainName(item.displayLink);
      let color;

      try {
        color = await getColorFromURL(item.link);
      } catch (err) {
        console.error(`Error while processing image: ${err.message}`);
        color = "#23272A"; // Discord default color or any other fallback color
      }

    
      const embed = new DefaultEmbed()
        .setColor(color)
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setTitle(domainName)
        .setURL(item.image.contextLink)
        .setDescription(item.snippet)
        .setImage(item.link)
        .setFooter({ text: `Page ${page + 1}/${maxPages} from Google Images (${serverSafety ? 'Safe' : 'Unsafe'})`, iconURL: "https://www.google.com/favicon.ico" });
    
      await sentMessage.edit({ embeds: [embed] });
    
      const backArrow = "⏪";
      const forwardArrow = "⏩";
      if (page > 0 && !sentMessage.reactions.cache.find((r) => r.emoji.name === backArrow)) {
        await sentMessage.react(backArrow);
      }
      if (page === 0) {
        const backReaction = sentMessage.reactions.cache.find((r) => r.emoji.name === backArrow);
        if (backReaction) {
          await backReaction.remove();
        }
      }
      if (!sentMessage.reactions.cache.find((r) => r.emoji.name === forwardArrow)) {
        await sentMessage.react(forwardArrow);
      }
    }
    
    const sentMessage = await message.reply("Loading image...");
    try {
      await updateEmbed(sentMessage, currentPage);
    } catch (error) {
      console.error(`Error updating embed: ${error.message}`);
      const warnEmbed = new WarnEmbed({ description: `No results for **${query}**` },message)
      return message.channel.send({ embeds: [warnEmbed] });
    }


    const filter = (reaction, user) => {
      return ["⏪", "⏩"].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    const reactionCollector = sentMessage.createReactionCollector({ filter, time: 60000 });

    reactionCollector.on("collect", async (reaction, user) => {
      if (reaction.emoji.name === "⏩" && currentPage < maxPages - 1) {
        currentPage++;
      } else if (reaction.emoji.name === "⏪" && currentPage > 0) {
        currentPage--;
      }

      await updateEmbed(sentMessage, currentPage);
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
  }
}

