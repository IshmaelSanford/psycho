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
      name: "infractions",
      enabled: true,
      permission: PermissionFlagsBits.KickMembers,
      syntax: "infractions <user>",
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

    const infractions = await this.client.plugins.moderation.getInfractions(
      message.guild,
      member
    );

    if (!infractions.length)
      return message.reply({
        embeds: [new ErrorEmbed({ description: `No infractions found.` },message)],
      });

    let index = 1;
    await message.reply({
      embeds: [
        new DefaultEmbed()
          .setTitle(`${member.user.tag}'s infractions`)
          .setDescription(
            `${infractions
              .slice(-20)
              .map(
                (i) =>
                  `**#${index++}** Moderator: <@${i.moderator}> | Reason: \`${
                    i.reason
                  }\` | <t:${Math.floor(i.date / 1000)}:R>`
              )
              .join("\n")}`
          ),
      ],
    });
  }
};
