const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "levelignorerole",
      enabled: true,
      aliases: ['lir', 'lvlir', 'lvligr'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "lir <@role>",
      about: "Ignore the leveling system for a specific role",
    });
  }
  async execute(message, args) {
    const role = message.mentions.roles.first();

    if (!role)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    await this.client.plugins.leveling.ignoreRole(role);

    const embed = new SuccessEmbed({
      description: `Successfully added ${role} to roles ignore list.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
