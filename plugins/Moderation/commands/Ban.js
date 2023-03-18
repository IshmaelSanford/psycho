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
      name: "ban",
      enabled: true,
      permission: PermissionFlagsBits.BanMembers,
      syntax: "ban <user> [reason]",
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

    if (!member.bannable)
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `Member ${member} is not bannable!` }),
        ],
      });

    await member.ban({ reason, days: 1 });

    await message.reply({
      embeds: [new SuccessEmbed({ description: `User ${member} was banned!` })],
    });

    let logChannel = message.guild.channels.cache.get(
      this.client.plugins.settings.getModLog(message.guild)
    );

    await logChannel?.send({
      embeds: [
        new DefaultEmbed()
          .setAuthor({
            name: `${member.user.tag} was banned`,
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
              name: "Delete message",
              value: `from 24 hours`,
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
