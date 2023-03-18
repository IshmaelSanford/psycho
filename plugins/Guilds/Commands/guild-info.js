const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guild-info",
      enabled: true,
      syntax: "guild-info [user]",
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const guild = this.client.plugins.guilds.userGuild(
      message.guild.id,
      user.id
    );

    if (!guild) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `**${user.tag}** is not in a guild.`,
          }),
        ],
      });
    }

    const owner = guild.members.find((m) => m.rank === "owner");
    const admins = guild.members.filter((m) => m.rank === "admin");
    const members = guild.members.filter((m) => m.rank === "member");

    let adminsText = admins.map((a) => `> <@${a.id}>`).join("\n") || "> None";
    let membersText = members.map((m) => `> <@${m.id}>`).join("\n") || "> None";

    const embed = new DefaultEmbed()
      .setTitle(`Guild Info: ${guild.name}`)
      .setColor(guild.color)
      .setThumbnail(guild.icon)
      .setDescription(
        `**Owner:** <@${owner.id}>\n\n**Admins (${admins.length}):**\n${adminsText}\n\n**Members (${members.length}):**\n${membersText}`
      );

    message.reply({ embeds: [embed] });
  }
};
