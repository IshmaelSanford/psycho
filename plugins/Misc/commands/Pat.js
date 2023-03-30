const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const { getColorFromURL } = require("color-thief-node");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "pat",
      enabled: true,
      syntax: "pat <user>",
      about: 'Pat someones head',
      example: 'pat @psycho',
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const tenorApiKey = process.env.TENOR_API_KEY;
    const searchQuery = "anime pat";
    const apiUrl = `https://g.tenor.com/v1/search?q=${encodeURIComponent(searchQuery)}&key=${tenorApiKey}&limit=50`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.results.length === 0) {
      return message.reply("Sorry, I couldn't find any pat GIFs!");
    }

    const randomGif = data.results[Math.floor(Math.random() * data.results.length)];
    const gifUrl = randomGif.media[0].gif.url;
    let color;

    try {
      color = await getColorFromURL(gifUrl);
    } catch (err) {
      console.error(`Error while processing image: ${err.message}`);
      color = "#23272A"; // Discord default color or any other fallback color
    }

    const embed = new DefaultEmbed()
      .setColor(color)
      .setTitle(
        `🫳 ${message.author.username} pats ${
          user.id !== message.author.id ? user.username : "themselves"
        }!`
      )
      .setImage(gifUrl);

    await message.channel.send({ embeds: [embed] });
  }
};
