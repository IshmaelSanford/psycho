const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guild-leave",
      enabled: true,
      syntax: "guild-leave",
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

    const owner = guild.members.find((r) => r.rank === "owner");

    if (owner.id === message.author.id) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You are the owner of this guild!",
          },message),
        ],
      });
    }

    guild.members = guild.members.filter((r) => r.id !== message.author.id);

    await this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You have left the guild!`,
        },message),
      ],
    });
  }
};
