const {
  SlashCommandBuilder,
  SelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("@discordjs/builders");
const { Command } = require("../../../structures/");
const { PermissionFlagsBits, ButtonStyle } = require("discord.js");
const { DefaultEmbed, SuccessEmbedDm } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "ticket-panel",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("ticket-panel")
        .setDescription("Panel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((c) =>
          c.setName("channel").setDescription("channel").setRequired(true)
        )
        .addStringOption((x) =>
          x.setName("message").setDescription("Message").setRequired(false)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });

    let description = interaction.options.getString("message", false);
    let channel = interaction.options.getChannel("channel", true);

    if (!description)
      description = "📨 Click button below to open your ticket.";

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder({
        label: "Click to open",
        emoji: { name: "📨" },
        style: ButtonStyle.Secondary,
        custom_id: "open_ticket",
      })
    );

    const panel = new DefaultEmbed({
      title: "Support Ticket",
      description,
    });

    await channel.send({
      embeds: [panel],
      components: [row],
    });

    await interaction.editReply({
      embeds: [
        new SuccessEmbedDm({
          description: `Successfully created reaction pane in ${channel}.`,
        }),
      ],
    });
  }
};
