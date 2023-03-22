const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Command } = require("../../../structures");
const {
  WarnEmbed,
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

    const members = await this.client.plugins.moderation.getStaffList(
      message.guild
    );

    if (!members.length)
      return message.channel.send({
        embeds: [
          new WarnEmbed({
            description: `There are no staff members at the moment.`,
          },message),
        ],
      });

    let index = 1;

    const embed = new DefaultEmbed()
    .setAuthor({
      name: `${message.guild.name}`,
      iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
    })
      .setTitle(`🛠️ Staff Members • ${members.length}`)
      .setColor('#66757f')
      .setDescription(
        members
          .map((x) => `\`${index++}\`ㅤ•ㅤ<@${x}>ㅤ•ㅤ\`${x}\``)
          .join("\n")
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));

    await message.channel.send({ embeds: [embed] });
  }
};
