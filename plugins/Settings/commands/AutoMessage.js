const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "automessage",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("automessage")
        .setDescription("Auto Message")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add Auto Message")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Channel")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("message")
                .setDescription("Message")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option.setName("time").setDescription("Time").setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove Auto Message")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Channel")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("list").setDescription("List Auto Message")
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("clear").setDescription("Clear Auto Message")
        ),
    });
  }
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const channel = interaction.options.getChannel("channel");
      const message = interaction.options.getString("message");
      const time = ms(interaction.options.getString("time"));

      if (!time) {
        interaction.reply({
          embeds: [
            new ErrorEmbed({
              description: "Invalid time",
            }),
          ],
        });
        return;
      }

      this.client.plugins.settings.addAutoMessage(
        interaction.guild,
        channel,
        time,
        message
      );

      interaction.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully added auto message to ${channel}`,
          }),
        ],
      });
    } else if (subcommand === "remove") {
      const channel = interaction.options.getChannel("channel");

      this.client.plugins.settings.removeAutoMessage(
        interaction.guild,
        channel
      );

      interaction.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully removed auto message from ${channel}`,
          }),
        ],
      });
    } else if (subcommand === "list") {
      const autoMessages = this.client.plugins.settings.getAutoMessages(
        interaction.guild
      );

      if (!autoMessages.length) {
        interaction.reply({
          embeds: [
            new ErrorEmbed({
              description: "There are no auto messages",
            }),
          ],
        });
      } else {
        const embed = new DefaultEmbed();

        embed.setTitle("Auto Messages");

        embed.setDescription(
          autoMessages
            .map(
              (autoMessage) =>
                `**Channel:** <#${autoMessage.channel}>\n**Message:** ${
                  autoMessage.message
                }\n**Time:** ${ms(autoMessage.time)}\n`
            )
            .join("\n")
        );

        interaction.reply({ embeds: [embed] });
      }
    } else if (subcommand === "clear") {
      this.client.plugins.settings.clearAutoMessages(interaction.guild);

      interaction.reply({
        embeds: [
          new SuccessEmbed({
            description: "Successfully cleared auto messages",
          }),
        ],
      });
    }
  }
};
