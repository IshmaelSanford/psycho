const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Command } = require("../../../structures");
const {
  ErrorEmbed,
  SuccessEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");

const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "mute",
      enabled: true,
      permission: PermissionFlagsBits.BanMembers,
      syntax: "mute <user> <time> [reason]",
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

    let duration = args[1];

    try {
      duration = await ms(duration);
    } catch (error) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description:
              "Invalid time format. Format Example: **10m, 10h, 10d, 2w**..",
          },message),
        ],
      });
    }
    const reason = args.slice(2).join(" ") || "No reason provided!";

    await member.timeout(duration, reason);

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `User ${member} was temp-muted for ${ms(duration, {
            long: true,
          })}!`,
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
            name: `${member.user.tag} was temp-muted`,
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
              name: "Duration",
              value: `${ms(duration, { long: true })}`,
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
