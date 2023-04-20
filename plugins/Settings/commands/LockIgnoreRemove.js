const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbedDm, DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "lockignoreremove",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("lockignoreremove")
        .setDescription("Lock Ignore Remove")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((x) =>
          x.setName("channel").setDescription("Channel").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);

    await this.client.plugins.settings.removeLockIgnore(
      interaction.guild,
      channel
    );

    interaction.editReply({
      embeds: [
        new SuccessEmbedDm({
          description: `Removed ${channel} from lock ignored channels.`,
        }),
      ],
    });
  }
};
