const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits, messageLink } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "starboard-toggle",
      enabled: true,
      syntax: "starboard-toggle",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    let status = this.client.plugins.starboard.getStatus(message.guild);

    await this.client.plugins.starboard.toggle(message.guild);

    const embed = new SuccessEmbed({
      description: `Successfully toggled starboard to \`${
        !status === true ? "enabled" : "disabled"
      }\``,
    });

    await message.reply({ embeds: [embed] });
  }
};
