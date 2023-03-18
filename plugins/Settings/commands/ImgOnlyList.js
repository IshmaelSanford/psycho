const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbed, DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "imgonlylist",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("imgonlylist")
        .setDescription("Image Only List")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channels = await this.client.plugins.settings.getImgOnlyList(
      interaction.guild
    );

    interaction.editReply({
      embeds: [
        new DefaultEmbed({
          description: `${
            channels?.map((x) => `<#${x}>`).join(", ") || "No channels found."
          }`,
        }),
      ],
    });
  }
};
