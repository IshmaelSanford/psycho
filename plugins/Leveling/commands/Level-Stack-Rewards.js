const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits, messageLink } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "stack-rewards",
      enabled: true,
      syntax: "stack-rewards",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    let status = this.client.plugins.leveling.getStackStatus(message.guild);

    await this.client.plugins.leveling.toggleStack(message.guild);

    const embed = new SuccessEmbed({
      description: `Successfully toggled leveling stack rewards to \`${
        !status === true ? "enabled" : "disabled"
      }\``,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
