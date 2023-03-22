const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "starboardsetchannel",
      enabled: true,
      staffOnly: true,
      aliases: ['ssch', 'starsetch'],
      syntax: "ssch <channel>",
      about: 'Set the channel for Starboard',
      example: 'starsetch #board',
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    if (!channel)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.starboard.setChannel(message.guild, channel);

    const embed = new SuccessEmbed({
      description: `Successfully set ${channel} for starboard.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
