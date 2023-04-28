const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Command } = require("../../../structures");
const {
  ErrorEmbed,
  DefaultEmbed,
  LockEmbed,
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
      SendMessages: false,
      Connect: false,
    });
  
    message.reply({
      embeds: [new LockEmbed({ description: `Locked channel ${channel}` }, message)],
    });
  }
};
