const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "autorole-remove",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "autorole-remove <@role>",
      staffOnly: true,
    });
  }
  async execute(message) {
    const role = message.mentions.roles.first();

    if (!role)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    this.client.plugins.roles.autoRolesRemove(message.guild, role);

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully removed ${role} from autoroles list.`,
        }),
      ],
    });
  }
};
