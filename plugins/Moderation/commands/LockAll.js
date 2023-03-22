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
      name: "lockall",
      enabled: true,
      permission: PermissionFlagsBits.KickMembers,
      syntax: "lockall",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    const channels = message.guild.channels.cache;

    const ignores = this.client.plugins.settings.getLockIgnoreList(
      message.guild
    );

    for (const [id, channel] of channels) {
      if (ignores.includes(channel.id)) continue;
      channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {
        SendMessages: false,
        Connect: false,
      });
    }

    message.reply({
      embeds: [new SuccessEmbed({ description: `Locked all channels.` },message)],
    });
  }
};
