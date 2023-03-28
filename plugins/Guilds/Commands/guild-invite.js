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
      name: "guild-invite",
      enabled: true,
      syntax: "guild-invite <user>",
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
            description: "You can't invite members!",
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

    if (guild.members.some((r) => r.id === member.id)) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "This member is already in your guild!",
          },message),
        ],
      });
    }

    const userGuild = this.client.plugins.guilds.userGuild(
      message.guild.id,
      member.id
    );

    if (userGuild) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "This member is already in a guild!",
          },message),
        ],
      });
    }

    const filter = (interaction) => {
      return (
        interaction.user.id === member.id &&
        interaction.customId === "guild-invite-accept"
      );
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("guild-invite-accept")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success)
    );

    const msg = await message.reply({
      embeds: [
        new DefaultEmbed({
          description: `${member} do you want to join ${message.author}'s guild?`,
        }),
      ],
      components: [row],
    });

    const interaction = await msg
      .awaitMessageComponent({
        filter,
        time: 30000,
      })
      .catch(() => {});

    if (!interaction) {
      return msg.edit({
        embeds: [
          new ErrorEmbed({
            description: "The member didn't accept the invite!",
          },message),
        ],
        components: [],
      });
    }

    const newGuild = this.client.plugins.guilds.get(message.guild.id, guild.id);

    newGuild.members.push({
      id: member.id,
      rank: "member",
      roles: [],
    });

    this.client.plugins.guilds.set(message.guild.id, guild.id, newGuild);

    interaction.update({
      embeds: [
        new SuccessEmbed({
          description: `${member} has joined ${guild.name}!`,
        },message),
      ],
      components: [],
    });
  }
};
