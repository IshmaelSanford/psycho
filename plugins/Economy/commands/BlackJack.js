const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { ErrorEmbed, SuccessEmbed } = require("../../../embeds");
const Blackjack = require("../../../structures/Blackjack");
const { CommandInteraction } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "blackjack",
      aliases: ['bj'],
      enabled: true,
    });
  }
  async execute(message, args) {
    const bet = parseInt(args[0]);

    if (isNaN(bet)) return message.reply("❌ Bet must be valid number.");

    const { stats } = await this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (bet > stats.cash) {
      return message.reply({
        content: `❌ You don't have enough money in cash.`,
      });
    }

    await this.client.plugins.economy.removeFromBalance(
      message.guild.id,
      message.author.id,
      bet
    );

    const { result } = await Blackjack(message, {
      commandType: "message",
    });

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

    switch (result) {
      case "WIN": {
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
        await this.client.plugins.economy.addToBalance(
          message.guild.id,
          message.author.id,
          bet * 2 * K
        );
        break;
      }
      case "LOSE": {
        this.client.plugins.economy.setStat(
          message.guild.id,
          message.author.id,
          "gambling_streak",
          0
        );

        break;
      }
      case "TIE": {
        this.client.plugins.economy.setStat(
          message.guild.id,
          message.author.id,
          "gambling_streak",
          0
        );
        await this.client.plugins.economy.addToBalance(
          message.guild.id,
          message.author.id,
          bet
        );

        break;
      }
      case "DOUBLE WIN": {
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
        await this.client.plugins.economy.addToBalance(
          message.guild.id,
          message.author.id,
          bet * 3 * K
        );
        this.client.plugins.economy.addAchievement(
          message.guild.id,
          message.author.id,
          "excitement",
          100
        );

        break;
      }
      case "DOUBLE LOSE": {
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
        break;
      }
      case "CANCEL": {
        await this.client.plugins.economy.addToBalance(
          message.guild.id,
          message.author.id,
          bet
        );
        break;
      }
      case "TIMEOUT": {
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
        break;
      }
    }
  }
};
