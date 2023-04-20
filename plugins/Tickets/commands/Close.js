const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbedDm, ErrorEmbedDm, DefaultEmbed } = require("../../../embeds");
const { Command } = require("../../../structures/");
const { PermissionFlagsBits } = require("discord.js");
const transcripts = require("discord-html-transcripts");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "close",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("close")
        .setDescription("Close")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    });
  }
  async execute(interaction) {
    await interaction.deferReply();

    let isTicketChannel = false;
    let ticketCreator;

    const indexes = this.client.plugins.tickets.database.indexes;

    for (var index of indexes) {
      const ticket = this.client.plugins.tickets.getData({ id: index });
      if (ticket?.channel !== interaction.channel.id) continue;
      isTicketChannel = true;
      ticketCreator = index;
    }

    if (!isTicketChannel)
      return interaction.editReply({
        embeds: [
          new ErrorEmbedDm({
            description: `This channel is not a ticket!`,
            ephemeral: true,
          }),
        ],
      });

    await interaction.editReply({
      embeds: [
        new SuccessEmbedDm({
          description: `Ticket ${interaction.channel} will be closed in **5** seconds.`,
        }),
      ],
    });

    const attachment = await transcripts.createTranscript(interaction.channel);

    try {
      const logChannel = interaction.guild.channels.cache.get(
        this.client.plugins.settings.getTicketsLogsChannel(interaction.guild)
      );
      await logChannel.send({
        embeds: [
          new DefaultEmbed()
            .setTitle("Ticket closed")
            .addFields(
              { name: "User", value: `<@${ticketCreator}>` },
              { name: "Moderator", value: `${interaction.user}` }
            )
            .setTimestamp()
            .setFooter({ text: `Transcript will be attached below.` }),
        ],
      });
      await logChannel.send({ files: [attachment] });
    } catch (error) {}

    setTimeout(async () => {
      try {
        await interaction.channel.delete();
        await this.client.plugins.tickets.deleteTicket({ id: ticketCreator });
      } catch (error) {
        if (interaction)
          await interaction.editReply({
            embeds: [
              new ErrorEmbedDm({
                description: `Unable to delete the channel, please check bot's permissions.`,
              }),
            ],
            ephemeral: true,
          });
      }
    }, 5000);
  }
};
