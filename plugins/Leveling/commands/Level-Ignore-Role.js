const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "level-ignore-role",
      enabled: true,
      syntax: "level-ignore-role <@role>",
      staffOnly: true,
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
