const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbed, DefaultEmbed } = require("../../../embeds");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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

    const reacts = await this.client.plugins.settings.getReactList(interaction.guild);
    const itemsPerPage = 10;
    const pageCount = Math.ceil(reacts.length / itemsPerPage);

    const createPageEmbed = (page) => {
      const start = itemsPerPage * page;
      const end = start + itemsPerPage;
      const itemsOnPage = reacts.slice(start, end);

      return new DefaultEmbed({
        description: itemsOnPage
          ?.map((x) => `<#${x.channel}> ${x.message} ${x.emoji}`)
          .join("\n") || "No reacts found.",
      });
    };

    let currentPage = 0;

    const previousButton = new ButtonBuilder()
      .setCustomId("previous")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0);

    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === pageCount - 1);

    const row = new ActionRowBuilder().addComponents(previousButton, nextButton);

    await interaction.editReply({
      embeds: [createPageEmbed(currentPage)],
      components: [row],
    });

    const filter = (i) => i.user.id === interaction.user.id && i.isButton() && (i.customId === 'previous' || i.customId === 'next');
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      componentType: "BUTTON",
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId === "previous") {
        currentPage -= 1;
      } else if (buttonInteraction.customId === "next") {
        currentPage += 1;
      }

      previousButton.setDisabled(currentPage === 0);
      nextButton.setDisabled(currentPage === pageCount - 1);

      await buttonInteraction.update({
        embeds: [createPageEmbed(currentPage)],
        components: [new ActionRowBuilder().addComponents(previousButton, nextButton)],
      });
    });

    collector.on("end", () => {
      interaction.editReply({
        embeds: [createPageEmbed(currentPage)],
        components: [],
      });
    });
  }
};