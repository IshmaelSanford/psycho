const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { ErrorEmbed, SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "seticon",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("seticon")
        .setDescription("Set Icon")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((str) =>
          str.setName("url").setDescription("Image URL").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const url = interaction.options.getString("url");

    try {
      await interaction.guild.edit({ icon: url });
    } catch (error) {
      return interaction.editReply({
        embeds: [new ErrorEmbed({ description: `Invalid image.` })],
      });
    }

    await interaction.editReply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully changed guild icon.`,
        }),
      ],
    });
  }
};
