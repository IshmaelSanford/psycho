const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbedDm, ErrorEmbedDm } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reactremove",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("reactremove")
        .setDescription("React Remove")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((ch) =>
          ch.setName("channel").setDescription("Channel").setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("message").setDescription("message").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);
    const message = interaction.options.getString("message", true);

    await this.client.plugins.settings.removeReact(
      interaction.guild,
      channel,
      message
    );

    await interaction.editReply({
      embeds: [
        new SuccessEmbedDm({
          description: `Successfuly removed react for message \`${message}\`.`,
        }),
      ],
    });
  }
};
