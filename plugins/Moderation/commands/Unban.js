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
      name: "unban",
      enabled: true,
      permission: PermissionFlagsBits.BanMembers,
      syntax: "unban <user_id>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const id = args[0];

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    await message.guild.bans.remove(id);

    await message.reply({
      embeds: [
        new SuccessEmbed({ description: `User ${member} is now unbanned.` },message),
      ],
    });

    let logChannel = message.guild.channels.cache.get(
      this.client.plugins.settings.getModLog(message.guild)
    );

    await logChannel?.send({
      embeds: [
        new DefaultEmbed()
          .setAuthor({
            name: `${member.user.tag} is now unbanned`,
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
          ])
          .setTimestamp(Date.now()),
      ],
    });
  }
};
