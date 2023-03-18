const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reactadd",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("reactadd")
        .setDescription("React Add")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((ch) =>
          ch.setName("channel").setDescription("Channel").setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("message").setDescription("message").setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("emoji").setDescription("emoji").setRequired(true)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", true);
    const message = interaction.options.getString("message", true);
    const emoji = interaction.options.getString("emoji", true);

    let msg;
    try {
      msg = await interaction.channel.send({
        content: `Checking emoji...`,
      });
      await msg.react(emoji);
    } catch (error) {
      return msg.edit({
        embeds: [
          new ErrorEmbed({
            description: `Emoji is not valid.`,
          }),
        ],
      });
    }

    await msg.delete();

    await this.client.plugins.settings.addReact(
      interaction.guild,
      channel,
      message,
      emoji
    );

    await interaction.editReply({
      embeds: [
        new SuccessEmbed({
          description: `Successfuly saved react add for message \`${message}\`.`,
        }),
      ],
    });
  }
};
