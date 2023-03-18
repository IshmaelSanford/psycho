const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { ErrorEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setbanner",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("setbanner")
        .setDescription("Set Banner")
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
      await interaction.guild.edit({ banner: url });
    } catch (error) {
      return interaction.editReply({
        embeds: [
          new ErrorEmbed({
            description: `You don't have banner unlocked or image is not valid.`,
          }),
        ],
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
