const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const { getColorFromURL } = require("color-thief-node");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const TENOR_API_KEY = process.env.TENOR_API_KEY;;

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "slap",
      enabled: true,
      syntax: "slap <user>",
      about: 'Slap a your friends or enemies',
      example: 'slap @psycho',
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const response = await fetch(
      `https://api.tenor.com/v1/search?q=anime%20slap&key=${TENOR_API_KEY}&limit=50`
    );

    if (!response.ok) {
      console.error(
        `Error fetching data from Tenor: ${response.status} ${response.statusText}`
      );
      console.error("Response headers:", response.headers.raw());
      return;
    }

    const data = await response.json();
    const gifIndex = Math.floor(Math.random() * data.results.length);
    const gifUrl = data.results[gifIndex].media[0].gif.url;
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
        `✋ ${message.author.username} slaps ${
          user.id !== message.author.id ? user.username : "themselves"
        }!`
      )
      .setImage(gifUrl);

    await message.channel.send({ embeds: [embed] });
  }
};
