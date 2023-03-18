const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
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
      name: "level-rewards",
      enabled: true,
      syntax: "level-rewards>",
    });
  }
  async execute(message, args) {
    const roles = this.client.plugins.leveling.getLevelRoles(message.guild);

    const embed = new DefaultEmbed({
      title: "Level Rewards",
      description: `${
        roles.map((x) => `<@&${x.role}> on level **${x.amount}**`).join("\n") ||
        "No rewards found."
      }`,
    });

    await message.reply({ embeds: [embed] });
  }
};
