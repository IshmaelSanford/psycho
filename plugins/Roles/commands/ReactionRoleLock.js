const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
  WarnEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reactionrole-lock",
      enabled: true,
      aliases: ['rrlock'],
      permission: PermissionFlagsBits.Administrator,
      example: 'Lock all reaction roles on the server',
      syntax: "reactionrole-lock",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    this.client.plugins.roles.reactionRoleLock(message.guild.id);

    await message.channel.send({
      embeds: [
        new WarnEmbed({
          description: `Successfully locked all reaction roles.`,
        },message),
      ],
    });
  }
};
