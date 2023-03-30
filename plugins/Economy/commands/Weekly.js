const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const moment = require("moment");
const setup = require("moment-duration-format");
setup(moment);

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "weekly",
      enabled: true,
    });
  }
  async execute(message) {
    const { cooldowns } = await this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (Date.now() < cooldowns.nextWeekly)
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You need to wait **${moment
              .duration(cooldowns.nextWeekly - Date.now())
              .format('d [days] h [hours] m [minutes] s [seconds]'
              )}** before your next claim`
          },message),
        ],
      });

    this.client.plugins.economy.weekly(message.guild.id, message.author.id);

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

    if (K === 2) {
      this.client.plugins.economy.addToBalance(
        message.guild.id,
        message.author.id,
        this.client.config.economy.weekly
      );
    }

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Claimed weekly reward of **${this.client.plugins.economy.parseAmount(
            this.client.config.economy.weekly * K,
            message.guild.id,
            message.author.id
          )}**`,
        },message),
      ],
    });
  }
};
