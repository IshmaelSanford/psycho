const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "trigger",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("trigger")
        .setDescription("Trigger")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add a trigger")
            .addStringOption((option) =>
              option
                .setName("trigger")
                .setDescription("The trigger")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("response")
                .setDescription("The response")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove a trigger")
            .addStringOption((option) =>
              option
                .setName("trigger")
                .setDescription("The trigger")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("list").setDescription("List all triggers")
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("clear").setDescription("Clear all triggers")
        ),
    });
  }
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const trigger = interaction.options.getString("trigger");
      const response = interaction.options.getString("response");

      this.client.plugins.settings.addTrigger(
        interaction.guild,
        trigger,
        response
      );

      interaction.reply({
        embeds: [
          new SuccessEmbed({
            description: `Added trigger \`${trigger}\` with response \`${response}\``,
          }),
        ],
      });
    } else if (subcommand === "remove") {
      const trigger = interaction.options.getString("trigger");

      this.client.plugins.settings.removeTrigger(interaction.guild, trigger);

      interaction.reply({
        embeds: [
          new SuccessEmbed({
            description: `Removed trigger \`${trigger}\``,
          }),
        ],
      });
    } else if (subcommand === "list") {
      const triggers = this.client.plugins.settings.getTriggers(
        interaction.guild
      );

      if (!triggers.length) {
        return interaction.reply({
          embeds: [
            new ErrorEmbed({
              description: "There are no current triggers.",
            }),
          ],
        });
      }

      interaction.reply({
        embeds: [
          new DefaultEmbed({
            title: "Triggers",
            description: triggers.map((r) => r.trigger).join("\n"),
          }),
        ],
      });
    } else if (subcommand === "clear") {
      this.client.plugins.settings.clearTriggers(interaction.guild);

      interaction.reply({
        embeds: [
          new SuccessEmbed({
            description: "Cleared all triggers",
          }),
        ],
      });
    }
  }
};
