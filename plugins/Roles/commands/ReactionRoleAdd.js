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
      permission: PermissionFlagsBits.Administrator,
      syntax: "reactionrole-add <channel> <message_id> <emoji> <role>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();
    const message_id = args[1];
    const emoji = args[2];
    const role = message.mentions.roles.first();

    if (!channel || !message_id || !emoji || !role)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    this.client.plugins.roles.reactionRoleAdd(
      message.guild.id,
      channel.id,
      message_id,
      emoji,
      role.id
    );

    try {
      let msg = await channel.messages.fetch(message_id);
      await msg.react(emoji);
    } catch (error) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `An error ocurred: some of parameters are not valid.`,
          }),
        ],
      });
    }

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully created reaction role for ${emoji}.`,
        }),
      ],
    });
  }
};
