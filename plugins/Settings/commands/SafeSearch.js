const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, WarnEmbedDm } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "safesearch",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("safesearch")
        .setDescription("Toggle safe search for Google Images")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable safe search")
            .setRequired(true)
        ),
    });
  }

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let enabled = interaction.options.getBoolean("enabled", true);

    await this.client.plugins.settings.setSafeSearch(interaction.guild, enabled);

    await interaction.editReply({
      embeds: [
        new WarnEmbedDm({
          description: `Safe search has been ${enabled ? "enabled" : "disabled"}.`,
        }),
      ],
    });
  }
};
