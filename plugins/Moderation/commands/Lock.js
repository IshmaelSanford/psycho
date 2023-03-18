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
      name: "lock",
      enabled: true,
      permission: PermissionFlagsBits.KickMembers,
      syntax: "lock <#channel>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();

    channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {
      SendMessages: false,
      Connect: false,
    });

    message.reply({
      embeds: [new SuccessEmbed({ description: `Locked channel ${channel}` })],
    });
  }
};
