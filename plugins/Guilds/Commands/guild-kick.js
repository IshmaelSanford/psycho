const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const {
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guild-kick",
      enabled: true,
      syntax: "guild-kick <user>",
    });
  }
  async execute(message, args) {
    const guild = this.client.plugins.guilds.userGuild(
      message.guild.id,
      message.author.id
    );

    if (!guild) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "You are not in a guild!" },message)],
      });
    }

    const hasPermissions = guild.members.some(
      (r) =>
        r.id === message.author.id && (r.rank === "owner" || r.rank === "admin")
    );

    if (!hasPermissions) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You can't kick members!",
          },message),
        ],
      });
    }

    const member = message.mentions.members.first();

    if (!member) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    if (!guild.members.some((r) => r.id === member.id)) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "This member isn't in your guild!",
          },message),
        ],
      });
    }

    if (member.id === message.author.id) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You can't kick yourself!",
          },message),
        ],
      });
    }

    const authorMember = guild.members.find((r) => r.id === message.author.id);
    const memberMember = guild.members.find((r) => r.id === member.id);

    if (
      authorMember.rank === "admin" &&
      (memberMember.rank === "owner" || memberMember.rank === "admin")
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You can't kick this member!",
          },message),
        ],
      });
    }

    guild.members = guild.members.filter((r) => r.id !== member.id);

    await this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `${member} has been kicked!`,
        },message),
      ],
    });
  }
};
