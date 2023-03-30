const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "transfer",
      aliases: ['give', 'wire'],
      enabled: true,
      syntax: 'transfer <user> <amount>',
      about: 'Give a user some of your money',
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const { stats } = this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (amount > stats.cash) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You don't have enough money in cash.`,
          },message),
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
      description: `Successfully transfered **${this.client.plugins.economy.parseAmount(
        amount
      )}** to ${user}'s balance.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
