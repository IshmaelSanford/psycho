const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "prefix",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("prefix")
        .setDescription("Set Prefix")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((str) =>
          str
            .setName("prefix")
            .setDescription("Prefix")
            .setMinLength(1)
            .setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let prefix = interaction.options.getString("prefix", true);

    await this.client.plugins.settings.setPrefix(interaction.guild, prefix);

    await interaction.editReply({
      embeds: [
        new SuccessEmbed({
          description: `Prefix changed to \`${prefix}[command]\``,
        }),
      ],
    });
  }
};
