const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { WarnEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "autorole-clear",
      enabled: true,
      aliases: ['arclear', 'arc'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "autorole-clear",
      example: 'Clear all autoroles on the server',
      staffOnly: true,
    });
  }
  async execute(message) {
    this.client.plugins.roles.autoRolesClear(message.guild);

    await message.channel.send({
      embeds: [
        new WarnEmbed({
          description: `Successfully cleared autoroles list.`,
        },message),
      ],
    });
  }
};
