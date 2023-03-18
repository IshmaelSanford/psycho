const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Command } = require("../../../structures");
const {
  ErrorEmbed,
  SuccessEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      enabled: true,
      permission: PermissionFlagsBits.KickMembers,
      syntax: "kick <user> [reason]",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const member = message.mentions.members.first();

    if (!member)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    const reason = args.slice(1).join(" ") || "No reason provided!";

    if (!member.kickable)
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `Member ${member} is not kickable!` }),
        ],
      });

    await member.kick({ reason });

    await message.reply({
      embeds: [new SuccessEmbed({ description: `User ${member} was kicked!` })],
    });

    let logChannel = this.client.plugins.settings.getModLog(message.guild);

    await logChannel?.send({
      embeds: [
        new DefaultEmbed()
          .setAuthor({
            name: `${member.user.tag} was kicked`,
            iconURL: member.user.displayAvatarURL({ dynamic: true }),
          })
          .addFields([
            {
              name: "Moderator",
              value: `${message.author.toString()} (${message.author.id})`,
            },
            {
              name: "Member",
              value: `${member.user.tag} (${member.user.id})`,
            },
            {
              name: "Reason",
              value: reason,
            },
          ])
          .setTimestamp(Date.now()),
      ],
    });
  }
};
