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
      name: "guild-name",
      enabled: true,
      syntax: "guild-name <name>",
    });
  }
  async execute(message, args) {
    const name = args.join(" ");

    if (!name) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

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

    if (owner.id !== message.author.id) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You are not the owner of this guild!",
          },message),
        ],
      });
    }

    if (name.length > 32) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "The guild name must be less than 32 characters!",
          },message),
        ],
      });
    }

    guild.name = name;

    await this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully changed the guild name to \`${name}\`!`,
        },message),
      ],
    });
  }
};
