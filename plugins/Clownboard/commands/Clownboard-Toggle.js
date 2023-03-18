const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits, messageLink } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "clownboard-toggle",
      enabled: true,
      syntax: "clownboard-toggle",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    let status = this.client.plugins.starboard.getStatus(message.guild);

    await this.client.plugins.clownboard.toggle(message.guild);

    const embed = new SuccessEmbed({
      description: `Successfully toggled clownboard to \`${
        !status === true ? "enabled" : "disabled"
      }\``,
    });

    await message.reply({ embeds: [embed] });
  }
};
