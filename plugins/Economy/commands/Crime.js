const { SlashCommandBuilder } = require("discord.js");
const { ErrorEmbed, SuccessEmbed, DefaultEmbed } = require("../../../embeds");
const { Command } = require("../../../structures");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "crime",
      enabled: true,
    });
  }
  async execute(message) {
    const random = Math.floor(Math.random() * 100);

    let success = false;

    if (random > 56) success = true;

    let { message: content } = await this.client.plugins.economy.crime(
      message.guild.id,
      message.author.id,
      success
    );

    return await message.reply({
      embeds: [
        new DefaultEmbed({
          description: content,
        }),
      ],
    });
  }
};
