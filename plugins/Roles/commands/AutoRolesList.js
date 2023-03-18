const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "autorole-list",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "autorole-list",
      staffOnly: true,
    });
  }
  async execute(message) {
    const roles = this.client.plugins.roles.getAutoRolesList(message.guild);

    if (!roles.length)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "No autoroles found." })],
      });

    await message.reply({
      embeds: [
        new DefaultEmbed({
          title: "Auto Roles List",
          description: `${roles.map((x) => `<@&${x}>`).join("\n")}`,
        }),
      ],
    });
  }
};
