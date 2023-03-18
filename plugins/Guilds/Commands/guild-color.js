const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits, resolveColor } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guild-color",
      enabled: true,
      syntax: "guild-color <color>",
    });
  }
  async execute(message, args) {
    const colorRaw = args[0];
    let color;

    if (!colorRaw) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    try {
      color = resolveColor(colorRaw);
    } catch {}

    if (!color) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "The color you provided is not a valid color!",
          }),
        ],
      });
    }

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

    guild.color = color;

    await this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully changed the guild color to \`${colorRaw}\`!`,
        }),
      ],
    });
  }
};
