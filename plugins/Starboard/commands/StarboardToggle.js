const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits, messageLink } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "starboardtoggle",
      enabled: true,
      staffOnly: true,
      aliases: ['st', 'startoggle'],
      syntax: "st",
      about: 'Toggle Starboard',
      example: 'startoggle',
    });
  }
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    
    let status = this.client.plugins.starboard.getStatus(message.guild);

    await this.client.plugins.starboard.toggle(message.guild);

    const embed = new SuccessEmbed({
      description: `Successfully toggled starboard to \`${
        !status === true ? "enabled" : "disabled"
      }\``,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
