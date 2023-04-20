const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbedDm } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "disablecommands",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("disablecommands")
        .setDescription("Disable Commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((x) =>
          x.setName("channel").setDescription("channel").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);

    await this.client.plugins.settings.addDisabledCommand(
      interaction.guild,
      channel
    );

    interaction.editReply({
      embeds: [
        new SuccessEmbedDm({
          description: `Added ${channel} to blacklisted channels for commands.`,
        }),
      ],
    });
  }
};
