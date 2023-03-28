const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, WrongSyntaxEmbed, WarnEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "autorole-remove",
      enabled: true,
      aliases: ['arrem', 'arr'],
      permission: PermissionFlagsBits.Administrator,
      example: 'Remove a single auto role on the server',
      syntax: "autorole-remove <@role>",
      staffOnly: true,
    });
  }
  async execute(message) {
    const role = message.mentions.roles.first();

    if (!role)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    this.client.plugins.roles.autoRolesRemove(message.guild, role);

    await message.channel.send({
      embeds: [
        new WarnEmbed({
          description: `Successfully removed ${role} from autoroles list.`,
        },message),
      ],
    });
  }
};
