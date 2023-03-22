const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "autorole-add",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "autoroleadd <@role>",
      example: "Example",
      staffOnly: true,
    });
  }
  async execute(message) {
    const role = message.mentions.roles.first();

    if (!role)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax, this.example)],
      });

    this.client.plugins.roles.autoRolesAdd(message.guild, role);

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully added ${role} to autoroles list.`,
        }),
      ],
    });
  }
};
