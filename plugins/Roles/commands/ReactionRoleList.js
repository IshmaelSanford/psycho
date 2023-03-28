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
      aliases: ['rrlist', 'rrl'],
      permission: PermissionFlagsBits.Administrator,
      example: 'List all active reaction roles on the server',
      syntax: "reactionrole-list",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const roles = this.client.plugins.roles.getReactionRoleList(
      message.guild.id
    );

    if (!roles.length)
      return message.channel.send({
        embeds: [new ErrorEmbed({ description: "No reaction roles found." },message)],
      },message);

    let index = 1;
    await message.channel.send({
      embeds: [
        new DefaultEmbed({
          title: "Reaction Roles List",
          description: `${roles
            .map(
              (x) =>
                `[Reaction Role ${index++}](https://discord.com/channels/${
                  message.guild.id
                }/${x.channel_id}/${x.message_id}) ${x.emoji} <@&${x.role_id}>`
            )
            .join("\n")}`,
        }),
      ],
    });
  }
};
