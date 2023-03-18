const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "hug",
      enabled: true,
      syntax: "hug <user>",
      about: 'Hug a your friends or enemies',
      example: 'hug @psycho',
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const tenorApiKey = process.env.TENOR_API_KEY;
    const searchQuery = "anime hug";
    const apiUrl = `https://g.tenor.com/v1/search?q=${encodeURIComponent(searchQuery)}&key=${tenorApiKey}&limit=50`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.results.length === 0) {
      return message.reply("Sorry, I couldn't find any hug GIFs!");
    }

    const randomGif = data.results[Math.floor(Math.random() * data.results.length)];
    const gifUrl = randomGif.media[0].gif.url;

    const embed = new DefaultEmbed()
      .setTitle(
        `🫂 ${message.author.username} hugs ${
          user.id !== message.author.id ? user.username : "themselves"
        }!`
      )
      .setImage(gifUrl);

    await message.channel.send({ embeds: [embed] });
  }
};
