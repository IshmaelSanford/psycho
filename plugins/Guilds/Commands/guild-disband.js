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
      name: "guild-disband",
      enabled: true,
      syntax: "guild-disband",
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

    const owner = guild.members.find((r) => r.rank === "owner");

    if (owner.id !== message.author.id) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You are not the owner of this guild!",
          }),
        ],
      });
    }

    await this.client.plugins.guilds.delete(message.guild.id, guild.id);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You have disbanded your guild!`,
        }),
      ],
    });
  }
};
