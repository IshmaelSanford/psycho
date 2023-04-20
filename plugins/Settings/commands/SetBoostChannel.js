const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbedDm } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setboostchannel",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("setboostchannel")
        .setDescription("Set Boost Channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((x) =>
          x.setName("channel").setDescription("Channel").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);

    await this.client.plugins.settings.setBoostChannel(
      interaction.guild,
      channel
    );

    interaction.editReply({
      embeds: [
        new SuccessEmbedDm({
          description: `Set ${channel} for boost channel.`,
        }),
      ],
    });
  }
};
