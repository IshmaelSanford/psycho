const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "starboardsetthreshold",
      enabled: true,
      staffOnly: true,
      aliases: ['sst', 'starsetth'],
      syntax: "ssch <ammount>",
      about: 'Set the threshold for Starboard',
      example: 'starsetch 3',
    });
  }
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    
    const amount = parseInt(args[0]);

    if (isNaN(amount))
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.starboard.setThreshold(message.guild, amount);

    const embed = new SuccessEmbed({
      description: `Successfully set \`${amount}\` for starboard threshold.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
