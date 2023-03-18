const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "pray",
      enabled: true,
    });
  }
  async execute(message) {
    if (
      this.client.plugins.economy.cooldown(
        message.guild.id,
        message.author.id,
        "pray",
        1000 * 60 * 5
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You must wait 5 minutes before praying again`,
          }),
        ],
      });
    }

    const hasHolyWater = this.client.plugins.economy.hasItemInInventory(
      message.guild.id,
      message.author.id,
      "holy_water",
      true
    );

    const base = Math.floor(Math.random() * 1000) + 1;
    let reward = hasHolyWater ? base * 2 : base;

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

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You praying has been rewarded with **$${reward}**.`,
        }),
      ],
    });
  }
};
