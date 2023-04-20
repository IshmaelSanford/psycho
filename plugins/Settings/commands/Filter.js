const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const { SuccessEmbedDm } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "filter",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("filter")
        .setDescription("Filter")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
          sub
            .setName("add_word")
            .setDescription("Add Blacklisted word")
            .addStringOption((str) =>
              str.setName("word").setDescription("Word").setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("remove_word")
            .setDescription("Add Blacklisted word")
            .addStringOption((str) =>
              str.setName("word").setDescription("Word").setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub.setName("words_list").setDescription("Words List")
        )
        .addSubcommand((sub) =>
          sub.setName("words_clear").setDescription("Words Clear")
        )
        .addSubcommand((sub) =>
          sub
            .setName("nicknames")
            .setDescription("Nicknames")
            .addStringOption((str) =>
              str
                .setName("status")
                .setDescription("status")
                .addChoices(
                  { name: "Enabled", value: "true" },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
                .setRequired(true)
            )
            .addChannelOption((chnl) =>
              chnl
                .setName("channel")
                .setDescription("channel")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("caps")
            .setDescription("caps")
            .addStringOption((str) =>
              str
                .setName("status")
                .setDescription("status")
                .addChoices(
                  { name: "Enabled", value: "true" },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
                .setRequired(true)
            )
            .addChannelOption((chnl) =>
              chnl
                .setName("channel")
                .setDescription("channel")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("links")
            .setDescription("Links")
            .addStringOption((str) =>
              str
                .setName("status")
                .setDescription("status")
                .addChoices(
                  { name: "Enabled", value: "true" },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
                .setRequired(true)
            )
            .addChannelOption((chnl) =>
              chnl
                .setName("channel")
                .setDescription("channel")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("invites")
            .setDescription("invites")
            .addStringOption((str) =>
              str
                .setName("status")
                .setDescription("status")
                .addChoices(
                  { name: "Enabled", value: "true" },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
                .setRequired(true)
            )
            .addChannelOption((chnl) =>
              chnl
                .setName("channel")
                .setDescription("channel")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("massmentions")
            .setDescription("massmentions")
            .addStringOption((str) =>
              str
                .setName("status")
                .setDescription("status")
                .addChoices(
                  { name: "Enabled", value: "true" },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
                .setRequired(true)
            )
            .addChannelOption((chnl) =>
              chnl
                .setName("channel")
                .setDescription("channel")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("spam")
            .setDescription("Spam")
            .addStringOption((str) =>
              str
                .setName("status")
                .setDescription("status")
                .addChoices(
                  { name: "Enabled", value: "true" },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
                .setRequired(true)
            )
            .addChannelOption((chnl) =>
              chnl
                .setName("channel")
                .setDescription("channel")
                .setRequired(true)
            )
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const command = interaction.options.getSubcommand();

    switch (command) {
      case "add_word": {
        const word = interaction.options.getString("word", true);

        this.client.plugins.settings.addWord(interaction.guild, word);

        interaction.editReply({
          embeds: [
            new SuccessEmbedDm({
              description: `Added blacklisted word.`,
            }),
          ],
        });

        break;
      }
      case "remove_word": {
        const word = interaction.options.getString("word", true);

        this.client.plugins.settings.removeWord(interaction.guild, word);

        interaction.editReply({
          embeds: [
            new SuccessEmbedDm({
              description: `Removed blacklisted word.`,
            }),
          ],
        });
        break;
      }
      case "words_list": {
        let words = this.client.plugins.settings.getWords(interaction.guild);

        interaction.editReply({
          content: `${words.map((x) => `\`${x}\``).join(", ")}`,
        });
        break;
      }
      case "words_clear": {
        this.client.plugins.settings.clearWords(interaction.guild);

        interaction.editReply({
          embeds: [
            new SuccessEmbedDm({
              description: `Cleared bad filter words.`,
            }),
          ],
        });

        break;
      }
      case "nicknames": {
        const status = interaction.options.getString("status", true);
        const channel = interaction.options.getChannel("channel", true);

        this.client.plugins.settings.setNicknames(
          interaction.guild,
          status,
          channel
        );

        interaction.editReply({
          embeds: [
            new SuccessEmbedDm({
              description: `Updated nickname filter settings.`,
            }),
          ],
        });

        break;
      }
      case "caps": {
        const status = interaction.options.getString("status", true);
        const channel = interaction.options.getChannel("channel", true);

        this.client.plugins.settings.setAntiCaps(
          interaction.guild,
          status,
          channel
        );

        interaction.editReply({
          embeds: [
            new SuccessEmbedDm({
              description: `Updated caps filter settings.`,
            }),
          ],
        });

        break;
      }
      case "invites": {
        const status = interaction.options.getString("status", true);
        const channel = interaction.options.getChannel("channel", true);

        this.client.plugins.settings.setAntiLinks(
          interaction.guild,
          status,
          channel
        );

        interaction.editReply({
          embeds: [
            new SuccessEmbedDm({
              description: `Updated invites filter settings.`,
            }),
          ],
        });

        break;
      }
      case "massmentions": {
        const status = interaction.options.getString("status", true);
        const channel = interaction.options.getChannel("channel", true);

        this.client.plugins.settings.setMassMentions(
          interaction.guild,
          status,
          channel
        );

        interaction.editReply({
          embeds: [
            new SuccessEmbedDm({
              description: `Updated mass mentions filter settings.`,
            }),
          ],
        });
        break;
      }
      case "spam": {
        const status = interaction.options.getString("status", true);
        const channel = interaction.options.getChannel("channel", true);

        this.client.plugins.settings.setAntiSpam(
          interaction.guild,
          status,
          channel
        );

        interaction.editReply({
          embeds: [
            new SuccessEmbedDm({
              description: `Updated spam filter settings.`,
            }),
          ],
        });

        break;
      }
    }
  }
};
