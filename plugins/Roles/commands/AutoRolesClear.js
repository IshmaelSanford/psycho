const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "autorole-clear",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "autorole-clear",
      staffOnly: true,
    });
  }
  async execute(message) {
    this.client.plugins.roles.autoRolesClear(message.guild);

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully cleared autoroles list.`,
        }),
      ],
    });
  }
};
