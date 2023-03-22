const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Command } = require("../../../structures");
const {
  ErrorEmbed,
  SuccessEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "forcenick",
      aliases: ['nick'],
      enabled: true,
      permission: PermissionFlagsBits.ManageNicknames,
      syntax: "setnick <user> <nickname>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const member = message.mentions.members.first();

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const nick = args.slice(1).join(" ") || null;

    try {
      await member.setNickname(nick);
    } catch (error) {
      await member.setNickname(null);
    }

    await message.reply({
      embeds: [
        new SuccessEmbed({ description: `Changed nick for ${member}.` },message),
      ],
    });

    let logChannel = message.guild.channels.cache.get(
      this.client.plugins.settings.getModLog(message.guild)
    );

    await logChannel?.send({
      embeds: [
        new DefaultEmbed()
          .setAuthor({
            name: `${member.user.tag} was voice muted`,
            iconURL: member.user.displayAvatarURL({ dynamic: true }),
          })
          .addFields([
            {
              name: "Moderator",
              value: `${message.author.toString()} (${message.author.id})`,
            },
            {
              name: "Member",
              value: `${member.user.tag} (${member.user.id})`,
            },
            {
              name: "Reason",
              value: reason,
            },
          ])
          .setTimestamp(Date.now()),
      ],
    });
  }
};
