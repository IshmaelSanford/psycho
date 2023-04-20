const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, resolveColor } = require("discord.js");
const {
  SuccessEmbedDm,
  DefaultEmbed,
  ErrorEmbedDm,
  WrongSyntaxEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "goodbye",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("goodbye")
        .setDescription("Configure goodbye message")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to send goodbye message")
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
          new ErrorEmbedDm({
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
          new ErrorEmbedDm({
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

    this.client.plugins.settings.setGoodbye(interaction.guild, channel, data);

    interaction.reply({
      embeds: [
        new SuccessEmbedDm({
          description: `Goodbye message has been configured.`,
        }),
      ],
    });
  }
};
