const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "transfer",
      enabled: true,
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || !amount)
      return message.reply(
        `❌ Wrong syntax. Use: \`transfer <@user> <amount>\``
      );

    const { stats } = this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (amount > stats.cash) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You don't have enough money in cash.`,
          }),
        ],
      });
    }

    await this.client.plugins.economy.removeFromBalance(
      message.guild.id,
      message.author.id,
      amount
    );
    await this.client.plugins.economy.addToBalance(
      message.guild.id,
      user.id,
      amount
    );

    const embed = new SuccessEmbed({
      description: `Successfully transfered **$${this.client.plugins.economy.parseAmount(
        amount
      )}** to ${user}'s balance.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
