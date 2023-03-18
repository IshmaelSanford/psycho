const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "removemoney",
      enabled: true,
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || !amount)
      return message.reply(
        `❌ Wrong syntax. Use: \`removemoney (@user) (amount)\``
      );

    await this.client.plugins.economy.removeFromBalance(
      message.guild.id,
      user.id,
      amount
    );

    const embed = new SuccessEmbed({
      description: `Successfully removed **$${this.client.plugins.economy.parseAmount(
        amount
      )}** to ${user}'s balance.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
