const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Command } = require("../../../structures");
const {
  ErrorEmbed,
  SuccessEmbed,
  WrongSyntaxEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "unlockall",
      enabled: true,
      permission: PermissionFlagsBits.KickMembers,
      syntax: "unlockall",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channels = message.guild.channels.cache;

    const ignores = this.client.plugins.settings.getLockIgnoreList(
      message.guild
    );

    for (const [id, channel] of channels) {
      if (ignores.includes(channel.id)) continue;
      channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {
        SendMessages: true,
        Connect: true,
      });
    }

    message.reply({
      embeds: [new SuccessEmbed({ description: `Unlocked all channels.` })],
    });
  }
};
