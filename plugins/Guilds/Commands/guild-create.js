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
      name: "guild-create",
      enabled: true,
      syntax: "guild-create <name>",
    });
  }
  async execute(message, args) {
    const name = args.join(" ");

    if (!name) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    if (name.length > 32) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "The guild name cannot be longer than 32 characters.",
          },message),
        ],
      });
    }

    const existing = this.client.plugins.guilds.userGuild(
      message.guild.id,
      message.author.id
    );

    if (existing) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You are already in a guild.",
          },message),
        ],
      });
    }

    const { stats } = this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (stats.cash < 10_000_000) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description:
              "You do not have enough money to create a guild. You need $10,000,000.",
          },message),
        ],
      });
    }

    this.client.plugins.economy.removeFromBalance(
      message.guild.id,
      message.author.id,
      10_000_000
    );

    const id = this.client.plugins.guilds.randomId();

    const guild = this.client.plugins.guilds.set(message.guild.id, id, {
      id,
      name,
      icon: message.author.displayAvatarURL(),
      color: 0x3cdfff,
      roles: [],
      members: [
        {
          id: message.author.id,
          rank: "owner",
          roles: [],
        },
      ],
    });

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You have successfully created a guild with the name **${name}**.`,
        },message),
      ],
    });
  }
};
