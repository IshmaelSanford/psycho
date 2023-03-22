const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits, resolveColor } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "starboardsetcolor",
      enabled: false,
      staffOnly: true,
      aliases: ['sscl', 'starsetcl'],
      syntax: "ssch <hex>",
      about: 'Set the color for Starboard',
      example: 'starsetcl #000000',
    });
  }
  async execute(message, args) {
    
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    try {
      resolveColor(args[0]);
    } catch {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    const color = resolveColor(args[0]);

    await this.client.plugins.starboard.setColor(message.guild, color);

    const embed = new SuccessEmbed({
      description: `Successfully set color for starboard.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
