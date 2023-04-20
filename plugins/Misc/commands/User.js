const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");
const { Command } = require("../../../structures");
const moment = require("moment");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "user",
      aliases: ["usr"],
      enabled: false,
    });
  }
  async execute(message) {
    const member = message.mentions.members.first() || message.member;

    const userGuild = this.client.plugins.guilds.userGuild(
      message.guild.id,
      member.id
    );
    const memberData = this.client.plugins.economy.getData(
      message.guild.id,
      member.id
    );
    const guild = userGuild ? userGuild.name : "Not in a guild";
    const isMafia = memberData.stats.mafia;
    const prestige = Math.floor(memberData.stats.xp / 1000);
    const guild_roles = userGuild
      ? userGuild.members.find((r) => r.id === member.id).roles.join("\n")
      : "No roles";
    const afk = this.client.plugins.misc.getAFK(message.guild, member);
    const money = memberData.stats.cash;
    const messages = parseInt(
      this.client.plugins.leveling.getMessages(message.guild, member)
    );

    const roles = member.roles.cache
      .sort((a, b) => b.position - a.position)
      .filter((x) => x.name !== "@everyone")
      .map((x) => x.name)
      .slice(0, 10)
      .join("\n");

    const embed = new DefaultEmbed({
      author: {
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      },
      fields: [
        {
          name: "Username",
          value: `\`\`\`\n${member.user.username}\n\`\`\``,
          inline: true,
        },
        {
          name: "Discriminator",
          value: `\`\`\`\n#${member.user.discriminator}\n\`\`\``,
          inline: true,
        },
        {
          name: "Account ID",
          value: `\`\`\`\n${member.user.id}\n\`\`\``,
          inline: true,
        },
        {
          name: "Status",
          value: `\`\`\`\n${
            member.presence
              ? member.presence.status.replace("dnd", "Do not disturb")
              : "Offline"
          }\n\`\`\``,
          inline: true,
        },
        {
          name: "AFK Status",
          value: `\`\`\`\n${
            afk
              ? this.client.plugins.misc.getAFKMessage(message.guild, member)
              : "No"
          }\n\`\`\``,
          inline: true,
        },
        {
          name: `Activity (${
            member.presence ? member.presence.activities.length : 0
          })`,
          value: `\`\`\`\n${
            member.presence
              ? member.presence.activities.length
                ? member.presence.activities.map((x) => x.name).join("\n")
                : "No activity"
              : "No data"
          }\n\`\`\``,
          inline: true,
        },
        {
          name: `Roles (${roles.length >= 10 ? "top 10" : roles.length})`,
          value: `\`\`\`\n${
            roles.length ? roles : "No roles assigned"
          }\n\`\`\``,
          inline: true,
        },
        {
          name: "Created At",
          value: `\`\`\`\n${moment(member.user.createdAt).format(
            "LLL"
          )}\n\`\`\``,
          inline: true,
        },
        {
          name: "Joined At",
          value: `\`\`\`\n${moment(member.joinedAt).format("LLL")}\n\`\`\``,
          inline: true,
        },
        {
          name: "Guild",
          value: `\`\`\`\n${guild}\n\`\`\``,
          inline: true,
        },
        {
          name: "Guild Roles",
          value: `\`\`\`\n${guild_roles}\n\`\`\``,
          inline: true,
        },
        {
          name: "In Mafia",
          value: `\`\`\`\n${isMafia ? "Yes" : "No"}\n\`\`\``,
          inline: true,
        },
        {
          name: "Prestige Level",
          value: `\`\`\`\n${prestige}\n\`\`\``,
          inline: true,
        },
        {
          name: "Money",
          value: `\`\`\`\n${this.client.plugins.economy.parseAmount(
            money
          )}\n\`\`\``,
          inline: true,
        },
        {
          name: "Messages",
          value: `\`\`\`\n${this.client.plugins.economy.parseAmount(
            messages
          )}\n\`\`\``,
          inline: true,
        },
      ],
    });

    await message.reply({
      embeds: [embed],
    });
  }
};
