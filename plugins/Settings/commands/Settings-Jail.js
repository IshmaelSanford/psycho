const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbedDm, DefaultEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "jail-config",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("jail-config")
        .setDescription("Jail Config")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
          sub
            .setName("role")
            .setDescription("Jail Role")
            .addRoleOption((str) =>
              str.setName("role").setDescription("Role").setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("rename")
            .setDescription("Jail Rename")
            .addStringOption((str) =>
              str.setName("name").setDescription("Name").setRequired(true)
            )
        )
        // .addSubcommand((sub) =>
        //   sub
        //     .setName("auto_jail")
        //     .setDescription("Auto Jail")
        //     .addStringOption((str) =>
        //       str
        //         .setName("status")
        //         .setDescription("Status")
        //         .setChoices(
        //           { name: "Enabled", value: "enabled" },
        //           { name: "Disabled", value: "disabled" }
        //         )
        //         .setRequired(true)
        //     )
        //     .addStringOption((str) =>
        //       str
        //         .setName("inactivity_time")
        //         .setDescription("Inactivity Time")
        //         .setChoices(
        //           { name: "1 Week", value: "7" },
        //           { name: "2 Weeks", value: "14" },
        //           { name: "3 Weeks", value: "21" },
        //           { name: "1 Month", value: "30" },
        //           { name: "3 Months", value: "90" },
        //           { name: "6 Months", value: "180" }
        //         )
        //         .setRequired(true)
        //     )
        // )
        .addSubcommand((sub) =>
          sub
            .setName("log_channel")
            .setDescription("Jail Log Channel")
            .addChannelOption((channel) =>
              channel
                .setName("channel")
                .setDescription("Channel")
                .setRequired(true)
            )
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let subcommand = interaction.options.getSubcommand();

    if (subcommand === "role") {
      const role = interaction.options.getRole("role", true);

      this.client.plugins.settings.setJailRole(interaction.guild, role);

      interaction.editReply({
        embeds: [
          new SuccessEmbedDm({
            description: `Updated jail role.`,
          }),
        ],
      });
      return;
    }
    if (subcommand === "rename") {
      const name = interaction.options.getString("name", true);
      const jailRole = this.client.plugins.settings.getJailRole(
        interaction.guild
      );
      interaction.guild.roles.cache.get(jailRole)?.edit({ name });

      interaction.editReply({
        embeds: [
          new SuccessEmbedDm({
            description: `Renamed jail role.`,
          }),
        ],
      });
      return;
    }
    // if (subcommand === "autojail") {
    // }
    if (subcommand === "log_channel") {
      const channel = interaction.options.getChannel("channel", true);

      this.client.plugins.settings.setJailLogChannel(
        interaction.guild,
        channel
      );

      interaction.editReply({
        embeds: [
          new SuccessEmbedDm({
            description: `Updated jail log channel.`,
          }),
        ],
      });
      return;
    }
    // if (subcommand === "autojail") {
    //   const status = interaction.options.getString("status", true);
    //   const inactivity_time = interaction.options.getString(
    //     "inactivity_time",
    //     true
    //   );

    //   //   this.client.plugins.settings.setAutoJail(
    //   //     interaction.guild,
    //   //     status,
    //   //     inactivity_time
    //   //   );
    // }
  }
};
