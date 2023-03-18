const { SlashCommandBuilder } = require("@discordjs/builders");
const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

const moment = require("moment");
const { ChannelType } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "server-info",
      enabled: true,
      staffOnly: true,
    });
  }
  async execute(message) {
    const channels = {
      text: message.guild.channels.cache.filter(
        (x) => x.type === ChannelType.GuildText
      ),
      voice: message.guild.channels.cache.filter(
        (x) => x.type === ChannelType.GuildVoice
      ),
      category: message.guild.channels.cache.filter(
        (x) => x.type === ChannelType.GuildCategory
      ),
    };
    const roles = {
      total: message.guild.roles.cache.size,
    };
    const members = {
      total: message.guild.memberCount.toLocaleString(),
    };

    const embed = new DefaultEmbed()
      .setAuthor({
        name: `${message.guild.name} (${message.guild.id})`,
        iconURL: message.guild.iconURL({ dynamic: true }),
      })
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields([
        {
          name: "Owner",
          value: `<@!${message.guild.ownerId}>`,
          inline: true,
        },
        {
          name: "Members",
          value: `${members.total}/${message.guild.maximumMembers / 1000}K`,
          inline: true,
        },
        {
          name: "Roles",
          value: `${roles.total} roles`,
          inline: true,
        },
        {
          name: "Channels",
          value: `${channels.text.size} texts,
          ${channels.voice.size} voice,
          ${channels.category.size} categories`,
          inline: true,
        },
        {
          name: "Boosting",
          value: `${message.guild.premiumSubscriptionCount}/14 boosts, 
          ${message.guild.premiumTier}`,
          inline: true,
        },
        {
          name: "Vanity URL",
          value: `${
            message.guild.vanityURLCode
              ? "[.gg/" +
                message.guild.vanityURLCode +
                "](https://discord.gg/" +
                message.guild.vanityURLCode +
                ")"
              : "None"
          }`,
          inline: true,
        },
        {
          name: "Created at",
          value: `${moment(message.guild.createdTimestamp).format("LL")}`,
          inline: true,
        },
        {
          name: "You joined at",
          value: `${moment(message.member.joinedTimestamp).format("LL")}`,
          inline: true,
        },
      ]);
    if (message.guild.vanityURLCode) {
      embed.author.url = `https://discord.gg/${message.guild.vanityURLCode}`;
    }

    await message.reply({ embeds: [embed] });
  }
};
