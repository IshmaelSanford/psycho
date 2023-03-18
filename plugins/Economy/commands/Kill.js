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
      name: "kill",
      enabled: true,
      syntax: "kill <user>",
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
            description: "You must be in the mafia to kill someone!",
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
        "kill",
        1000 * 60 * 60 * 3
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description:
              "You must wait 3 hours before trying to kill someone again!",
          }),
        ],
      });
    }

    const userData = this.client.plugins.economy.getData(
      message.guild.id,
      user.id
    );

    if (
      this.client.plugins.economy.hasItemInInventory(
        message.guild.id,
        user.id,
        "black_cat",
        true
      )
    ) {
      this.client.plugins.economy.removeItemFromInventory(
        message.guild.id,
        user.id,
        "black_cat"
      );

      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `**${user.tag}** had a black cat with him, you got scared and ran away!`,
          }),
        ],
      });
    }

    const hasNearDeath = this.client.plugins.economy.hasItemInInventory(
      message.guild.id,
      user.id,
      "near_death",
      true
    );

    const hasLaughingCoffin = this.client.plugins.economy.hasItemInInventory(
      message.guild.id,
      message.author.id,
      "laughing_coffin",
      true
    );

    const successChance = hasNearDeath ? 25 : hasLaughingCoffin ? 46.66 : 40;

    const success = Math.floor(Math.random() * 100) < successChance;

    if (success) {
      const percentage = 0.5;
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

      const contracts = this.client.plugins.economy.getContracts(
        message.guild.id
      );

      let contractMoney = 0;

      for (const contract of contracts) {
        if (contract.target === user.id) {
          contractMoney += contract.bounty;
        }
      }

      if (contractMoney > 0) {
        const newContracts = contracts.filter(
          (contract) => contract.target !== user.id
        );

        this.client.plugins.economy.setContracts(
          message.guild.id,
          newContracts
        );

        this.client.plugins.economy.addToBalance(
          message.guild.id,
          message.author.id,
          contractMoney
        );

        message.reply({
          embeds: [
            new SuccessEmbed({
              description: `You've claimed the bounty of **$${this.client.plugins.economy.parseAmount(
                contractMoney
              )}** on **${user.tag}**!`,
            }),
          ],
        });
      }

      return message.reply({
        embeds: [
          new SuccessEmbed({
            description: `You killed **${
              user.tag
            }** and got **$${this.client.plugins.economy.parseAmount(
              amount
            )}**!`,
          }),
        ],
      });
    } else {
      const percentage = Math.random() * 0.3 + 0.1;
      let amount = Math.floor(stats.cash * percentage);

      if (hasLaughingCoffin) {
        amount = Math.floor(amount / 2);
      }

      this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        message.author.id,
        amount
      );

      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You failed to kill **${
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
