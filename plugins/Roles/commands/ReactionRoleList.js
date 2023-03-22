const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reactionrole-list",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "reactionrole-list",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const roles = this.client.plugins.roles.getReactionRoleList(
      message.guild.id
    );

    if (!roles.length)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "No reaction roles found." })],
      },author);

    let index = 1;
    await message.reply({
      embeds: [
        new DefaultEmbed({
          title: "Reaction Roles List",
          description: `${roles
            .map(
              (x) =>
                `**#${index++}** [Message](https://discord.com/channels/${
                  message.guild.id
                }/${x.channel_id}/${x.message_id}) ${x.emoji} <@&${x.role_id}>`
            )
            .join("\n")}`,
        }),
      ],
    });
  }
};
