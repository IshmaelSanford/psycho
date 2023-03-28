const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const axios = require("axios");
const { PermissionFlagsBits, resolveColor } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guild-icon",
      enabled: true,
      syntax: "guild-icon <emoji>",
    });
  }
  async execute(message, args) {
    const guild = this.client.plugins.guilds.userGuild(
      message.guild.id,
      message.author.id
    );

    if (!guild) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "You are not in a guild!" },author)],
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

    let emoji = args[0]?.trim();
    let id;

    if (emoji?.startsWith("<") && emoji?.endsWith(">")) {
      id = emoji.match(/\d{15,}/g)[0];

      const type = await axios
        .get(`https://cdn.discordapp.com/emojis/${id}.gif `)
        .then((image) => {
          if (image) return "gif";
          else return "png";
        })
        .catch((error) => {
          return "png";
        });

      emoji = `https://cdn.discordapp.com/emojis/${id}.${type}`;
    } else if (emoji?.startsWith("http"))
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `You cannot add default emojis!` },author),
        ],
      });
    else
    return message.reply({
      embeds: [new WrongSyntaxEmbed(this.client, message, this)],
    });

    guild.icon = emoji;

    await this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully changed the guild icon!`,
        },message),
      ],
    });
  }
};
