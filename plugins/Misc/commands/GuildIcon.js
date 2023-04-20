const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const { getColorFromURL } = require("color-thief-node");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guildicon",
      enabled: true,
      aliases: ['gi', 'servericon', 'i'],
      syntax: "gi",
      about: 'view the servers icon',
      example: 'gi',
    });
  }
  async execute(message) {
    const guildIconURL = message.guild.iconURL({ dynamic: true, size: 4096 });

    if (!guildIconURL) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `${message.author.toString()}: This server doesn't have an icon.`,
          }),
        ],
      });
    }

    let color;

    try {
      color = await getColorFromURL(guildIconURL);
    } catch (err) {
      console.error(`Error while processing image: ${err.message}`);
      color = "#23272A";
    }

    const embed = new DefaultEmbed()
      .setAuthor({
        name: `requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(`${message.guild.name}'s Server Icon`)
      .setURL(guildIconURL)
      .setImage(guildIconURL)
      .setColor(color);

    await message.reply({ embeds: [embed] });
  }
};
