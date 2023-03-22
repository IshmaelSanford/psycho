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
      name: "unlock",
      enabled: true,
      permission: PermissionFlagsBits.KickMembers,
      syntax: "unlock <#channel>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    const channel = message.mentions.channels.first();

    channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {
      SendMessages: true,
      Connect: true,
    });

    message.reply({
      embeds: [
        new SuccessEmbed({ description: `Unlocked channel ${channel}` },message),
      ],
    });
  }
};
