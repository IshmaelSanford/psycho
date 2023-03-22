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
      name: "warn",
      enabled: true,
      permission: PermissionFlagsBits.KickMembers,
      syntax: "warn <user> [reason]",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const member = message.mentions.members.first();

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const reason = args.slice(1).join(" ") || "No reason provided!";

    await this.client.plugins.moderation.addInfraction(
      message.guild,
      member,
      message.author,
      reason
    );

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `User ${member} has been warned! \nReason: \`${reason}\``,
        },message),
      ],
    });

    let logChannel = message.guild.channels.cache.get(
      this.client.plugins.settings.getModLog(message.guild)
    );

    await logChannel?.send({
      embeds: [
        new DefaultEmbed()
          .setAuthor({
            name: `${member.user.tag} has been warned`,
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
