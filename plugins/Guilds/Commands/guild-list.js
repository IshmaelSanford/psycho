const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const {
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guild-list",
      enabled: true,
      syntax: "guild-list [page]",
    });
  }
  async execute(message, args) {
    const guilds = this.client.plugins.guilds.all(message.guild.id);

    const page = parseInt(args[0]) || 1;
    const maxPage = Math.ceil(guilds.length / 10);

    if (page > maxPage) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `Page ${page} does not exist. There are only ${maxPage} page${
              maxPage === 1 ? "" : "s"
            }.`,
          },message),
        ],
      });
    }

    if (page < 1) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `Page ${page} does not exist. There are only ${maxPage} page${
              maxPage === 1 ? "" : "s"
            }.`,
          },message),
        ],
      });
    }

    if (!guilds.length) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `There are no guilds in this server.`,
          },message),
        ],
      });
    }

    const guildsList = guilds
      .slice((page - 1) * 10, page * 10)
      .map((guild) => {
        return `${guild.name} - ${guild.members.length} member${
          guild.members.length === 1 ? "" : "s"
        }`;
      })
      .join("\n");

    const embed = new DefaultEmbed()
      .setTitle("Guilds")
      .setDescription(guildsList || "No guilds")
      .setFooter({
        text: `Page ${page} of ${maxPage}`,
      });

    message.reply({ embeds: [embed] });
  }
};
