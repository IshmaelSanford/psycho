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
      name: "listlevelrewards",
      enabled: true,
      aliases: ['llr', 'llvlr'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "llr",
      about: "List all of the level rewards in the server",
    });
  }
  async execute(message, args) {
    const roles = this.client.plugins.leveling.getLevelRoles(message.guild);

    const embed = new DefaultEmbed({
      title: "Level Rewards",
      description: `${
        roles.map((x) => `<@&${x.role}> on level **${x.amount}**`).join("\n") ||
        "No rewards found.\nUse `setlevel` to assign roles to levels"
      }`,
    });

    await message.reply({ embeds: [embed] });
  }
};
