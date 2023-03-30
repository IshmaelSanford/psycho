const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "work",
      enabled: true,
    });
  }
  async execute(message) {
    const { cooldowns } = await this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (Date.now() < cooldowns.nextWork)
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You need to wait **${ms(
              cooldowns.nextWork - Date.now(),
              {
                long: true,
              }
            )}** before your next work.`,
          },message),
        ],
      });

    let { job, earnings } = await this.client.plugins.economy.work(
      message.guild.id,
      message.author.id
    );

    if (
      this.client.plugins.economy.hasItemInInventory(
        message.guild.id,
        message.author.id,
        "ruby_charm",
        true
      )
    ) {
      if (Math.random() < 0.001) {
        earnings = Math.floor(Math.random() * 100000) + 1;
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
        earnings *= 2;
      }
    }

    this.client.plugins.economy.searchSpecialItem(message);

    const formattedEarnings = this.client.plugins.economy.parseAmount(earnings, message.guild.id, message.author.id);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You have worked as \`${job}\` and earned **${formattedEarnings}**`,
        },message),
      ],
    });
  }
};
