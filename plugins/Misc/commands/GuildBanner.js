const { Command } = require("../../../structures");
const { DefaultEmbed, ErrorEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guildbanner",
      enabled: true,
      aliases: ['gb'],
      syntax: "gb",
      about: 'View the servers banner',
      example: 'gb',
    });
  }
  async execute(message) {
    const guildBannerURL = message.guild.bannerURL({ dynamic: true, size: 4096 });

    if (!guildBannerURL) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `${message.author.toString()}: This server doesn't have a banner`,
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
    .setTitle(`${message.guild.name}'s Banner`)
    .setURL(guildBannerURL)
    .setImage(guildBannerURL)
    .setColor(color);

    await message.reply({ embeds: [embed] });
  }
};
