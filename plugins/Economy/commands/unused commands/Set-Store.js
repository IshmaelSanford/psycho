const { Command } = require("../../../../structures");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "set-store",
      enabled: false,
      syntax: "set-store <on/off>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const enabled = args[0] === "on" ? true : args[0] === "off" ? false : null;

    if (enabled === null)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    this.client.plugins.economy.setStore(message.guild, enabled);

    const embed = new SuccessEmbed({
      description: `Successfully ${enabled ? "enabled" : "disabled"} shop.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
