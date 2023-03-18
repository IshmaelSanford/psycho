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
      name: "starboard-set-threshold",
      enabled: true,
      syntax: "starboard-set-threshold <amount>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const amount = parseInt(args[0]);

    if (isNaN(amount))
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.starboard.setThreshold(message.guild, amount);

    const embed = new SuccessEmbed({
      description: `Successfully set \`${amount}\` for starboard threshold.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
