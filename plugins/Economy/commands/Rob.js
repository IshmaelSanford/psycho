const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "rob",
      enabled: true,
      syntax: "rob <user>",
    });
  }
  async execute(message, args) {
    const { stats } = this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    const user = message.mentions.users.first();

    if (!user) {
      return message.reply(new WrongSyntaxEmbed(this.name, this.syntax));
    }

    if (
      this.client.plugins.economy.cooldown(
        message.guild.id,
        message.author.id,
        "rob",
        1000 * 60 * 5
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description:
              "You must wait 5 minutes before robbing someone again!",
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
      "charlotte",
      true
    )
      ? 33
      : 30;

    const success = Math.floor(Math.random() * 100) < successChance;

    if (success) {
      const percentage = Math.random() * 0.4 + 0.1;
      const amount = Math.floor(userData.stats.cash * percentage);

      this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        user.id,
        amount
      );

      this.client.plugins.economy.addToBalance(
        message.guild.id,
        message.author.id,
        amount
      );

      return message.reply({
        embeds: [
          new SuccessEmbed({
            description: `You robbed **${
              user.tag
            }** and got **$${this.client.plugins.economy.parseAmount(
              amount
            )}**!`,
          }),
        ],
      });
    } else {
      const percentage = Math.random() * 0.1 + 0.1;
      const amount = Math.floor(stats.cash * percentage);

      this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        message.author.id,
        amount
      );

      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You failed to rob **${
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
