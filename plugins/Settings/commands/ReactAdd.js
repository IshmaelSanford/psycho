const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbedDm, ErrorEmbedDm } = require("../../../embeds");
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
        .addStringOption((str) =>
          str.setName("message").setDescription("message").setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("emoji").setDescription("emoji").setRequired(true)
        )
        .addChannelOption((ch) =>
        ch.setName("channel").setDescription("Channel").setRequired(false)
      ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
  
    const channel = interaction.options.getChannel("channel") || interaction.channel;
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
          new ErrorEmbedDm({
            description: `Emoji is not valid.`,
          }),
        ],
      });
    }
  
    await msg.delete();
  
    await this.client.plugins.settings.addReact(
      interaction.guild,
      channel, // This should already have the fallback channel
      message,
      emoji
    );
  
    await interaction.editReply({
      embeds: [
        new SuccessEmbedDm({
          description: `Successfuly added react add ${emoji} for message \`${message}\`.`,
        }),
      ],
    });
  }
};
