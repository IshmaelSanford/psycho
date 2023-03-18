const { SuccessEmbed, DefaultEmbed, ErrorEmbed } = require("../../../embeds");
const Event = require("../../../structures/Event");
const { ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "interactionCreate",
      enabled: true,
    });
  }
  async run(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.guild) return;

    if (interaction.customId !== "open_ticket") return;

    await interaction.deferReply({
      ephemeral: true,
    });

    const ticket = await this.client.plugins.tickets.getData(
      interaction.user.id
    );

    if (ticket)
      return interaction.editReply({
        embeds: [
          new ErrorEmbed({
            description: `You already have opened ticket! <#${ticket.channel}>`,
          }),
        ],
      });

    let supportRole = this.client.plugins.settings.getTicketsSupportRole(
      interaction.guild
    );
    supportRole = interaction.guild.roles.cache.get(supportRole);

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: interaction.channel.parentId,
      permissionOverwrites: [
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });

    if (supportRole)
      channel.permissionOverwrites.edit(supportRole.id, {
        ViewChannel: true,
      });

    let msgg = `✨ Hello {USER}, welcome to your ticket.
    🔎 Our support team will reach to you as soon as possible.`;

    let open_message = msgg.replace(/{USER}/g, interaction.user);

    let mentions = `<@!${interaction.user.id}>`;

    if (supportRole) mentions += ` ${supportRole}`;

    channel.send({
      content: mentions,
      embeds: [
        new DefaultEmbed({
          title: "Support System",
          description: open_message,
        }),
      ],
    });

    await this.client.plugins.tickets.addTicket(interaction.user, channel);

    interaction.editReply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully opened a ticket ${channel} for you.`,
        }),
      ],
    });
  }
};
