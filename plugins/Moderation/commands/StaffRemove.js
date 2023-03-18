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
      name: "stripstaff",
      aliases: ['sstrip', 'staff remove'],
      enabled: true,
      permission: PermissionFlagsBits.BanMembers,
      syntax: "stripstaff <@user>",
    });
  }
  async execute(message, args) {
    if (message.member.id !== message.guild.ownerId)
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `Only server owner can do this.` }),
        ],
      });

    const member = message.mentions.members.first();

    if (!member)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.moderation.removeStaff(message.guild, member);

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Removed ${member} from the staff list.`,
        }),
      ],
    });
  }
};
