const { Command } = require("../../../structures");
const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");

const { resolveColor } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setboostmessage",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("setboostmessage")
        .setDescription("Set Boost Message")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((x) =>
          x
            .setName("embed_description")
            .setDescription("Embed Description")
            .setRequired(true)
        )
        .addStringOption((x) =>
          x
            .setName("embed_title")
            .setDescription("Embed Title")
            .setRequired(false)
        )
        .addStringOption((x) =>
          x
            .setName("embed_color_hex")
            .setDescription("Embed Color Hex")
            .setRequired(false)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let description = interaction.options.getString("embed_description", true);
    let title = interaction.options.getString("embed_title", false);
    let color = interaction.options.getString("embed_color_hex", false);

    let embed = new EmbedBuilder();

    try {
      embed.setDescription(description);
      if (title) embed.setTitle(title);
      if (color) embed.setColor(resolveColor(color));
    } catch (error) {
      return interaction.editReply({
        embeds: [
          new ErrorEmbed({ description: `Some parameters are not valid.` }),
        ],
      });
    }

    await this.client.plugins.settings.setBoostMessage(
      interaction.guild,
      embed.data
    );

    interaction.editReply({
      embeds: [
        new SuccessEmbed({
          description: `Updated message embed for new boost event.`,
        }),
      ],
    });
  }
};
