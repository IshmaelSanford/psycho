const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "lockignoreadd",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("lockignoreadd")
        .setDescription("Lock Ignore Add")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((x) =>
          x.setName("channel").setDescription("Channel").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);

    await this.client.plugins.settings.addLockIgnore(
      interaction.guild,
      channel
    );

    interaction.editReply({
      embeds: [
        new SuccessEmbed({
          description: `Added ${channel} to lock ignored channels.`,
        }),
      ],
    });
  }
};
