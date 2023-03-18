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
      name: "reactionrole-remove",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "reactionrole-remove <channel> <message_id> <emoji>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();
    const message_id = args[1];
    const emoji = args[2];

    if (!channel || !message_id || !emoji)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    this.client.plugins.roles.reactionRoleRemove(
      message.guild.id,
      channel.id,
      message_id,
      emoji
    );

    try {
      let msg = await channel.messages.fetch(message_id);
      let reaction = await msg.reactions.cache.get(emoji);
      await reaction.users.remove(this.client.user.id);
    } catch (error) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `An error ocurred: Channel/Message ID or Emoji are not valid.`,
          }),
        ],
      });
    }

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully deleted reaction role for ${emoji}.`,
        }),
      ],
    });
  }
};
