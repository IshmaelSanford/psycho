const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, resolveColor } = require("discord.js");
const {
  SuccessEmbed,
  DefaultEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "welcome",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("welcome")
        .setDescription("Configure welcome message")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to send welcome message")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("content")
            .setDescription("Content message")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("embed_title")
            .setDescription("Embed title")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("embed_description")
            .setDescription("Embed Description")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("embed_color")
            .setDescription("Embed Color")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("embed_thumbnail")
            .setDescription("Embed Thumbnail")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("ping_user")
            .setDescription("Ping user?")
            .setRequired(false)
        ),
    });
  }
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const content = interaction.options.getString("content", false);
    const embedTitle = interaction.options.getString("embed_title", false);
    const embedDescription = interaction.options.getString(
      "embed_description",
      false
    );
    const embedColor = interaction.options.getString("embed_color", false);
    const embedThumbnail = interaction.options.getString(
      "embed_thumbnail",
      false
    );
    const pingUser =
      interaction.options.getBoolean("ping_user", false) || false;

    if (!channel.isTextBased()) {
      return interaction.reply({
        embeds: [
          new ErrorEmbed({
            description: "Channel must be text based",
          }),
        ],
      });
    }

    try {
      resolveColor(embedColor);
    } catch (error) {
      return interaction.reply({
        embeds: [
          new ErrorEmbed({
            description: "Invalid color",
          }),
        ],
      });
    }

    const data = {
      content: (pingUser ? "{user} " : "") + content || null,
      hasEmbed: !!(embedTitle || embedDescription),
      embed: {
        title: embedTitle || null,
        description: embedDescription || null,
        color: resolveColor(embedColor) || 0,
        thumbnail: embedThumbnail || undefined,
      },
    };

    this.client.plugins.settings.setWelcome(interaction.guild, channel, data);

    interaction.reply({
      embeds: [
        new SuccessEmbed({
          description: `Welcome message has been configured.`,
        }),
      ],
    });
  }
};
