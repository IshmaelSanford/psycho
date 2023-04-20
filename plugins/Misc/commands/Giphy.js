const { Command } = require("../../../structures");
const { 
  DefaultEmbed,
  ErrorEmbed,
  WarnEmbed,
} = require("../../../embeds");
const { getColorFromURL } = require("color-thief-node");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "giphy",
      aliases: ['gif'],
      syntax: "giphy <query>",
      example: 'giphy hello',
      enabled: true,
      about: 'Search for GIFs on Giphy',
    });
  }
  async execute(message, args) {
    if (!args.length) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({ description: `Please provide a **query**` },message),
        ],
      });
    }

    const query = encodeURIComponent(args.join(" "));
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=10`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.data.length === 0) {
        return message.channel.send({
          embeds: [
            new WarnEmbed({ description: `Returned with a **404** Error` },message),
          ],
        });
      }

      const randomIndex = Math.floor(Math.random() * data.data.length);
      const gifUrl = data.data[randomIndex].images.original.url;
      let color;

      try {
        color = await getColorFromURL(gifUrl);
      } catch (err) {
        console.error(`Error while processing image: ${err.message}`);
        color = "#23272A"; // Discord default color or any other fallback color
      }

      const embed = new DefaultEmbed()
        .setTitle(`GIF result for "${args.join(" ")}"`)
        .setImage(gifUrl)
        .setFooter({
          text: `Powered by Giphy`,
          iconURL: "https://media3.giphy.com/avatars/aprilfools/k5liU8fF35jQ.jpg",
        })
        .setColor(color);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply("Failed to fetch GIFs. Please try again.");
    }
  }
};
