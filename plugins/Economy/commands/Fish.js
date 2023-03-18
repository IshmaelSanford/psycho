const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "fish",
      enabled: true,
    });
  }
  async execute(message) {
    if (
      this.client.plugins.economy.cooldown(
        message.guild.id,
        message.author.id,
        "fish",
        1000 * 60 * 5
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You must wait 5 minutes before fishing again`,
          }),
        ],
      });
    }

    let reward = Math.floor(Math.random() * 1000) + 1;

    if (
      this.client.plugins.economy.hasItemInInventory(
        message.guild.id,
        message.author.id,
        "ruby_charm",
        true
      )
    ) {
      if (Math.random() < 0.001) {
        reward = Math.floor(Math.random() * 100000) + 1;
      }
    }

    if (
      this.client.plugins.economy.hasItemInInventory(
        message.guild.id,
        message.author.id,
        "snake_eyes",
        true
      )
    ) {
      if (Math.random() < 0.00004) {
        reward *= 2;
      }
    }

    this.client.plugins.economy.addToBalance(
      message.guild.id,
      message.author.id,
      reward
    );

    this.client.plugins.economy.searchSpecialItem(message);

    this.client.plugins.economy.addAchievement(
      message.guild.id,
      message.author.id,
      "first_catch",
      100
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You caught a fish and sold it for **$${reward}**.`,
        }),
      ],
    });
  }
};
