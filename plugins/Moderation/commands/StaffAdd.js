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
      name: "staff",
      aliases: ['staff give'],
      enabled: true,
      syntax: "staff <@user>",
    });
  }
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    if (message.member.id !== message.guild.ownerId)
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `Only server owner can do this.` },message),
        ],
      });

    const member = message.mentions.members.first();

    if (!member)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.moderation.addStaff(message.guild, member);

    await message.reply({
      embeds: [
        new SuccessEmbed({ description: `Added ${member} to the staff list.` },message),
      ],
    });
  }
};
