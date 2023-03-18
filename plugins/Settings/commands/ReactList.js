const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbed, DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reactlist",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("reactlist")
        .setDescription("React List")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const reacts = await this.client.plugins.settings.getReactList(
      interaction.guild
    );

    interaction.editReply({
      embeds: [
        new DefaultEmbed({
          description: `${
            reacts
              ?.map((x) => `<#${x.channel}> ${x.message} ${x.emoji}`)
              .join(", ") || "No reacts found."
          }`,
        }),
      ],
    });
  }
};
