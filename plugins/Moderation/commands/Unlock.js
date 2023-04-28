const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Command } = require("../../../structures");
const {
  ErrorEmbed,
  SuccessEmbed,
  WrongSyntaxEmbed,
  UnlockEmbed,
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
    let channel;
  
    if (args.length === 0) {
      // If no channel is mentioned, use the channel the message is sent in
      channel = message.channel;
    } else {
      // If a channel is mentioned, use the mentioned channel
      channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply({
          embeds: [new WrongSyntaxEmbed(this.client, message, this)],
        });
      }
    }
  
    channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {
      SendMessages: true,
      Connect: true,
    });

    message.reply({
      embeds: [
        new UnlockEmbed({ description: `Unlocked channel ${channel}` },message),
      ],
    });
  }
};
