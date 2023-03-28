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
      name: "reactionrole-remove",
      enabled: true,
      aliases: ['rrremove', 'rrrem', 'rrr'],
      permission: PermissionFlagsBits.Administrator,
      example: 'Remove reaction role(s) on messages',
      syntax: "reactionrole-remove <channel> <message_id> [--all] [<emoji>]",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();
    const message_id = args[1];
    const emoji = args[2];
    const allFlag = args.includes("--all");
  
    if (!channel || !message_id || (!emoji && !allFlag)) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
  
    try {
      let msg = await channel.messages.fetch(message_id);
  
      if (allFlag) {
        const reactionRoleList = this.client.plugins.roles.getReactionRoleList(
          message.guild.id
        );
  
        for (const rr of reactionRoleList) {
          if (rr.message_id === message_id) {
            const reaction = msg.reactions.cache.get(rr.emoji);
            if (reaction) {
              await reaction.remove();
            }
          }
        }
  
        this.client.plugins.roles.reactionRoleRemoveAll(message.guild.id, message_id);
        
      } else {
        this.client.plugins.roles.reactionRoleRemove(
          message.guild.id,
          message_id,
          emoji
        );
        let reaction = await msg.reactions.cache.get(emoji);
        await reaction.remove(); // Remove all users' reactions, including the bot's
      }
    } catch (error) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: `An error ocurred: Channel/Message ID or Emoji are not valid.`,
          }, message),
        ],
      });
    }
  
    await message.channel.send({
      embeds: [
        new WarnEmbed({
          description: allFlag
            ? `Successfully deleted all reaction roles for the message.`
            : `Successfully deleted reaction role for ${emoji}.`,
        }, message),
      ],
    });
  }  
};
