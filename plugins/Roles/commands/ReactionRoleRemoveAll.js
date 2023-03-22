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
      name: "reactionrole-removeall",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "reactionrole-removeall <channel> <message_id>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();
    const message_id = args[1];
    if (!channel || !message_id)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    this.client.plugins.roles.reactionRoleRemoveAll(
      message.guild.id,
      channel.id,
      message_id
    );

    try {
      let msg = await channel.messages.fetch(message_id);
      await msg.reactions.removeAll();
    } catch (error) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `An error ocurred: Channel/Message ID or Emoji are not valid.`,
          },author),
        ],
      });
    }

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully deleted all reaction roles.`,
        },author),
      ],
    });
  }
};
