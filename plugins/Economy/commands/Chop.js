const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "chop",
      enabled: true,
    });
  }
  async execute(message) {
    if (
      this.client.plugins.economy.cooldown(
        message.guild.id,
        message.author.id,
        "chop",
        1000 * 60 * 5
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You must wait 5 minutes before chopping again`,
          },message),
        ],
      });
    }

    let reward = Math.floor(Math.random() * 1000) + 1;

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You chopped a tree and sold it for **$${reward}**.`,
        },message),
      ],
    });
  }
};
