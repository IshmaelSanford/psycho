const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setticketsupport",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("setticketsupport")
        .setDescription("Ticket Support Role Set")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption((x) =>
          x.setName("role").setDescription("role").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const role = interaction.options.getRole("role", true);

    await this.client.plugins.settings.setTicketsSupportRole(
      interaction.guild,
      role
    );

    interaction.editReply({
      embeds: [
        new SuccessEmbed({
          description: `Set ${role} for ticket support role.`,
        }),
      ],
    });
  }
};
