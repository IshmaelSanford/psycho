const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setbal",
      enabled: true,
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || !amount)
      return message.reply({
        content: `❌ Wrong Syntax. Use: \`setbal (@user) (@amount)\``,
      });

    await this.client.plugins.economy.setBalance(
      message.guild.id,
      message.author.id,
      amount
    );

    const embed = new SuccessEmbed({
      description: `Successfully set **$${this.client.plugins.economy.parseAmount(
        amount
      )}** on ${user}'s balance.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
