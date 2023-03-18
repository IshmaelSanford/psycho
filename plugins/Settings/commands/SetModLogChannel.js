const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setmodlog",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("setmodlog")
        .setDescription("Set Mod Log Channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((x) =>
          x.setName("channel").setDescription("Channel").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);

    await this.client.plugins.settings.setModLog(interaction.guild, channel);

    interaction.editReply({
      embeds: [
        new SuccessEmbed({
          description: `Set ${channel} for mod log channel.`,
        }),
      ],
    });
  }
};
