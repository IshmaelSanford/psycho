const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "autoroleadd",
      enabled: true,
      aliases: ['aradd', 'ara'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "autoroleadd <@role>",
      example: "Automatically add roles to users when they join",
      staffOnly: true,
    });
  }
  async execute(message) {
    const role = message.mentions.roles.first();

    if (!role)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    this.client.plugins.roles.autoRolesAdd(message.guild, role);

    await message.channel.send({
      embeds: [
        new SuccessEmbed({
          description: `Successfully added ${role} to autoroles list.`,
        },message),
      ],
    });
  }
};
