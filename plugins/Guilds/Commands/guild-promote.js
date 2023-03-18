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
      name: "guild-promote",
      enabled: true,
      syntax: "guild-promote <user>",
    });
  }
  async execute(message, args) {
    const guild = this.client.plugins.guilds.userGuild(
      message.guild.id,
      message.author.id
    );

    if (!guild) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "You are not in a guild!" })],
      });
    }

    const member = message.mentions.members.first();

    if (!member) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    if (!guild.members.some((r) => r.id === member.id)) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "This member isn't in your guild!",
          }),
        ],
      });
    }

    const memberMember = guild.members.find((r) => r.id === member.id);

    if (memberMember.rank === "owner") {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "This member is already the owner of the guild!",
          }),
        ],
      });
    }

    if (memberMember.rank === "admin") {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "This member is already an admin of the guild!",
          }),
        ],
      });
    }

    memberMember.rank = "admin";

    await this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `${member} has been promoted to Admin!`,
        }),
      ],
    });
  }
};
