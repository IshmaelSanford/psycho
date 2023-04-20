const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbedDm } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "imgonlyadd",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("imgonlyadd")
        .setDescription("Image Only Add")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((x) =>
          x.setName("channel").setDescription("channel").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);

    this.client.plugins.settings.imageOnlyAdd(interaction.guild, channel);

    interaction.editReply({
      embeds: [
        new SuccessEmbedDm({
          description: `Added ${channel} to image-only list.`,
        }),
      ],
    });
  }
};
