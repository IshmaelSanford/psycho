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
      name: "staff list",
      aliases: ['staffl'],
      enabled: true,
      permission: PermissionFlagsBits.BanMembers,
      syntax: "staff list",
    });
  }
  async execute(message, args) {
    if (message.member.id !== message.guild.ownerId)
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `Only server owner can do this.` }),
        ],
      });

    const members = await this.client.plugins.moderation.getStaffList(
      message.guild
    );

    if (!members.length)
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `There are no staff members at the moment.`,
          }),
        ],
      });

    let index = 1;

    const embed = new DefaultEmbed()
      .setTitle(`Staff Members (${members.length})`)
      .setDescription(
        members
          .map((x) => `👔 **#${index++}** <@${x}> (\`ID: ${x}\`)`)
          .join("\n")
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));

    await message.reply({ embeds: [embed] });
  }
};
