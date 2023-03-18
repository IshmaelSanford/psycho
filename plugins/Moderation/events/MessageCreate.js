const { ErrorEmbed, DefaultEmbed } = require("../../../embeds");
const { Event } = require("../../../structures/");
const { PermissionFlagsBits } = require("discord.js");

const AntiSpam = require("discord-anti-spam");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageCreate",
      enabled: true,
    });
  }
  async run(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const client = this.client;

    let blacklistedWords = this.client.plugins.settings.getWords(message.guild);
    let caps = this.client.plugins.settings.getAntiCaps(message.guild);
    let invites = this.client.plugins.settings.getAntiLinks(message.guild);
    let massmentions = this.client.plugins.settings.getMassMentions(
      message.guild
    );
    let spam = this.client.plugins.settings.getSpam(message.guild);

    const inviteRegex =
      /(discord.(gg|io|me|li)|(discordapp|discord).com\/invite)\/.+/gi;
    const capsContent = message.content.replace(/[^A-Z]/g, "");

    const usage = (capsContent.length / message.content.length) * 100;

    for (const word of blacklistedWords) {
      if (message.content.toLowerCase().includes(word.toLowerCase()))
        return [
          sendLogEmbed("Blacklisted Word"),
          message.delete().catch(() => {}),
        ];
    }

    if (
      caps.enabled &&
      usage > 60 &&
      caps.channels.includes(message.channel.id)
    )
      return message.delete().catch(() => {});

    if (
      invites.enabled &&
      inviteRegex.test(message.content) &&
      invites.channels.includes(message.channel.id)
    )
      return [sendLogEmbed("Invite Links"), message.delete().catch(() => {})];

    if (
      massmentions &&
      message.mentions.users.size > 10 &&
      massmentions.channels.includes(message.channel.id)
    )
      return [sendLogEmbed("Mentions limit"), message.delete().catch(() => {})];

    if (spam.enabled && spam.channels.includes(message.channel.id)) {
      const antiSpam = new AntiSpam({
        warnThreshold: 3,
        muteTreshold: 1000,
        kickTreshold: 1000,
        banTreshold: 1000,
        warnMessage: "Stop spamming!",
        muteMessage: "You have been muted for spamming!",
        kickMessage: "You have been kicked for spamming!",
        banMessage: "You have been banned for spamming!",
        unMuteTime: 60,
        verbose: false,
        removeMessages: true,
        ignoredPermissions: [PermissionFlagsBits.Administrator],
      });

      antiSpam.message(message);
      return;
    }

    async function sendLogEmbed(reason) {
      let logChannel = message.guild.channels.cache.get(
        client.plugins.settings.getModLog(message.guild)
      );

      await logChannel?.send({
        embeds: [
          new DefaultEmbed()
            .setAuthor({
              name: `${message.member.user.tag}'s message was deleted`,
              iconURL: message.member.user.displayAvatarURL({ dynamic: true }),
            })
            .addFields([
              {
                name: "Moderator",
                value: `${client.user} (${client.user.id})`,
              },
              {
                name: "Member",
                value: `${message.member} (${message.member.id})`,
              },
              {
                name: "Reason",
                value: reason,
              },
              {
                name: "Message",
                value: `*${message.content}*`,
              },
            ])
            .setTimestamp(Date.now()),
        ],
      });
    }
  }
};
