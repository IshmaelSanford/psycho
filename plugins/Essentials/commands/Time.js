const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "time",
      enabled: true,
    });
  }
  async execute(message) {
    const embed = new DefaultEmbed().setDescription(
      `🌐 <t:${Math.floor(Date.now() / 1000)}:F>`
    );
    await message.reply({ embeds: [embed] });
  }
};
