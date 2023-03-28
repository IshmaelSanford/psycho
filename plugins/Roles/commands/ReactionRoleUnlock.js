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
      name: "reactionrole-unlock",
      aliases: ['rrunlock', 'rru'],
      permission: PermissionFlagsBits.Administrator,
      enabled: true,
      example: 'Unlock all reaction roles on the server',
      syntax: "reactionrole-unlock",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    this.client.plugins.roles.reactionRoleUnlock(message.guild.id);

    await message.channel.send({
      embeds: [
        new WarnEmbed({
          description: `Successfully unlocked all reaction roles.`,
        },message),
      ],
    });
  }
};
