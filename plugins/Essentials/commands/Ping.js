const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      enabled: true,
    });
  }
  async execute(message) {
    const embed = new DefaultEmbed().setDescription(
      `🏓 Pong! ${this.client.ws.ping}ms`
    );
    await message.reply({ embeds: [embed] });
  }
};
