const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "coinflip",
      aliases: ['coin','cf'],
      enabled: true,
      syntax: "cf <bet> <heads or tails>",
    });
  }
  async execute(message, args) {
    const bet = parseInt(args[0]);

    const side = args[1]?.toLowerCase();

    if (isNaN(bet))
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    if (!["heads", "tails"].includes(side))
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    const { stats } = await this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (bet > stats.cash) {
      return message.reply({
        content: `❌ You don't have enough money in cash.`,
      });
    }

    let successChance = 40;

    if (
      this.client.plugins.economy.hasItemInInventory(
        message.guild.id,
        message.author.id,
        "lucky_clover",
        true
      )
    ) {
      successChance += 5;
    }

    const success = Math.floor(Math.random() * 100) + 1 <= successChance;

    let K = 1;

    if (
      this.client.plugins.economy.hasItemInInventory(
        message.guild.id,
        message.author.id,
        "snake_eyes",
        true
      )
    ) {
      if (Math.random() < 0.00004) {
        K = 2;
      }
    }

    if (success) {
      await this.client.plugins.economy.addToBalance(
        message.guild.id,
        message.author.id,
        bet * K
      );
      await this.client.plugins.economy.addToGambled(
        message.guild.id,
        message.author.id,
        bet * 2 * K
      );

      this.client.plugins.economy.addAchievement(
        message.guild.id,
        message.author.id,
        "excitement",
        100
      );
      const winStreak =
        this.client.plugins.economy.getStat(
          message.guild.id,
          message.author.id,
          "gambling_streak"
        ) + 1;
      this.client.plugins.economy.setStat(
        message.guild.id,
        message.author.id,
        "gambling_streak",
        winStreak
      );
      if (winStreak === 5) {
        this.client.plugins.economy.addAchievement(
          message.guild.id,
          message.author.id,
          "luck_streak",
          500
        );
      }

      message.reply({
        content: `${
          side === "heads" ? "Heads" : "Tails"
        }! 🤑 You've won **$${this.client.plugins.economy.parseAmount(
          bet * 2 * K
        )}**!`,
      });
    } else {
      this.client.plugins.economy.setStat(
        message.guild.id,
        message.author.id,
        "gambling_streak",
        0
      );
      await this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        message.author.id,
        bet
      );
      await this.client.plugins.economy.addToGambled(
        message.guild.id,
        message.author.id,
        bet
      );
      message.reply({
        content: `😡 ${
          side === "heads" ? "Tails" : "Heads"
        }! You've lost **$${this.client.plugins.economy.parseAmount(bet)}**!`,
      });
    }
  }
};
