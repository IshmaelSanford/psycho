const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reactionrole-add",
      enabled: true,
      aliases: ['rradd', 'rra', 'rrcreate', 'rrnew'],
      permission: PermissionFlagsBits.Administrator,
      example: 'Add a reaction role to a message',
      syntax: "reactionrole-add <channel> <message_id> <emoji> <role> [--remove] [--removable] [--sticky]",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first() || message.channel;
    const message_id = args[1];
    const emoji = args[2];
    const role = message.mentions.roles.first();
  
    const remove_other_roles = args.includes('--remove');
    const remove_on_unreact = args.includes('--removable');
    const apply_on_rejoin = args.includes('--sticky');
  
    if (remove_other_roles && remove_on_unreact) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
  
    if (!message_id || !emoji || !role) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
  
    try {
      let fetchedChannel = await this.client.channels.fetch(channel.id);
      let msg = await fetchedChannel.messages.fetch(message_id);
  
      await msg.react(emoji);
  
      this.client.plugins.roles.reactionRoleAdd(
        message.guild.id,
        channel.id,
        message_id,
        emoji,
        role.id,
        { remove_other_roles, remove_on_unreact, apply_on_rejoin }
      );
    } catch (error) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: `An error ocurred: some parameters are not valid.`,
          }, message),
        ],
      });
    }
  
    await message.channel.send({
      embeds: [
        new SuccessEmbed({
          description: `Successfully created reaction role for ${emoji}.`,
        }, message),
      ],
    });
  }  
};
