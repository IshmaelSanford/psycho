const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, DefaultEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "settings",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription("Bot Settings")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
          sub.setName("clear").setDescription("Clear Settings")
        )
        .addSubcommand((sub) =>
          sub.setName("configuration").setDescription("Settings Preview")
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let subcommand = interaction.options.getSubcommand();

    if (subcommand === "clear") {
      this.client.plugins.settings.clear(interaction.guild);
    }
    if (subcommand === "configuration") {
      let data = this.client.plugins.settings.getData(interaction.guild);

      interaction.editReply({
        embeds: [
          new DefaultEmbed({
            title: "Server Config",
            fields: [
              {
                name: "Prefix",
                value:
                  this.client.plugins.settings.prefix(interaction.guild) ||
                  this.client.config.defaultPrefix,
                inline: true,
              },
              {
                name: "Jail Role",
                value: `<@&${data.jail.role_id || "Not set"}>`,
                inline: true,
              },
              {
                name: "Jail Logs",
                value: `<#${data.jail.log_channel || "Not set"}> `,
                inline: true,
              },
              {
                name: "Mod Logs",
                value: `<#${data.mod_log || "Not set"}>`,
                inline: true,
              },
              {
                name: "Lock Ignored",
                value:
                  data.lock_ignores.map((x) => `<#${x}>`).join(", ") ||
                  "Not set",
                inline: true,
              },
              {
                name: "Img Only",
                value:
                  data.img_only.map((x) => `<#${x}>`).join(", ") || "Not set",
                inline: true,
              },
              {
                name: "Boost Channel",
                value: `<#${data.boost_channel || "Not set"}>`,
                inline: true,
              },
              {
                name: "Welcome Channel",
                value: `<#${data.welcome.channel || "Not set"}>`,
                inline: true,
              },
              {
                name: "GoodBye Channel",
                value: `<#${data.goodbye.channel || "Not set"}>`,
                inline: true,
              },
              {
                name: "Blacklisted Words",
                value: `${
                  data.filter.words.map((x) => x).join(", ") || "Not set"
                }`,
                inline: true,
              },
              {
                name: "Nicknames",
                value: `Enabled: ${data.filter.nicknames.enabled}`,
                inline: true,
              },
              {
                name: "Anti Caps",
                value: `Enabled: ${data.filter.anti_caps.enabled}`,
                inline: true,
              },
              {
                name: "Anti Links",
                value: `Enabled: ${data.filter.anti_links.enabled}`,
                inline: true,
              },
              {
                name: "Mass Mentions",
                value: `Enabled: ${data.filter.mass_mentions.enabled}`,
                inline: true,
              },
              {
                name: "Spam",
                value: `Enabled: ${data.filter.spam.enabled}`,
                inline: true,
              },
              {
                name: "Ticket Logs",
                value: `<#${data.tickets.log_channel || "Not set"}>`,
                inline: true,
              },
              {
                name: "Ticket Role",
                value: `<@&${data.tickets.support_role || "Not set"}>`,
                inline: true,
              },
            ],
          }).setThumbnail(interaction.guild.iconURL({ dynamic: true })),
        ],
      });
    }
  }
};
