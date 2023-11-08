const { Command } = require("../../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "hack",
      enabled: false,
      syntax: "hack <user>",
    });
  }
  async execute(message, args) {
    const { stats } = this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (!stats.mafia) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You must be in a mafia to hack someone!",
          }),
        ],
      });
    }

    if (stats.xp < 5000) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You must be Prestige Level 5 to hack someone!",
          }),
        ],
      });
    }

    const user = message.mentions.users.first();

    if (!user) {
      return message.reply(new WrongSyntaxEmbed(this.name, this.syntax));
    }

    if (
      this.client.plugins.economy.cooldown(
        message.guild.id,
        message.author.id,
        "hack",
        1000 * 60 * 30
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description:
              "You must wait 30 minutes before hacking someone again!",
          }),
        ],
      });
    }

    const userData = this.client.plugins.economy.getData(
      message.guild.id,
      user.id
    );

    const successChance = this.client.plugins.economy.hasItemInInventory(
      message.guild.id,
      message.author.id,
      "cyber_ghost",
      true
    )
      ? 90
      : 50;

    const success = Math.floor(Math.random() * 100) < successChance;

    if (success) {
      const percentage = Math.random() * 0.1 + 0.1;
      const amount = Math.floor(userData.stats.cash * percentage);

      this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        user.id,
        amount
      );

      if (
        this.client.plugins.economy.hasItemInInventory(
          message.guild.id,
          message.author.id,
          "snake_eyes",
          true
        )
      ) {
        if (Math.random() < 0.00004) {
          amount *= 2;
        }
      }

      this.client.plugins.economy.addToBalance(
        message.guild.id,
        message.author.id,
        amount
      );

      return message.reply({
        embeds: [
          new SuccessEmbed({
            description: `You hacked **${
              user.tag
            }** and got **$${this.client.plugins.economy.parseAmount(
              amount
            )}**!`,
          }),
        ],
      });
    } else {
      const percentage = Math.random() * 0.2 + 0.1;
      const amount = Math.floor(stats.cash * percentage);

      this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        message.author.id,
        amount
      );

      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You failed to hacked **${
              user.tag
            }** and lost **$${this.client.plugins.economy.parseAmount(
              amount
            )}**!`,
          }),
        ],
      });
    }
  }
};
