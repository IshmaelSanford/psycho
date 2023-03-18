const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "clownboard-set-emoji",
      enabled: true,
      syntax: "clownboard-set-emoji <emoji>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const emoji = args[0];

    if (!emoji)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    try {
      await message.react(emoji);
    } catch (error) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid emoji" })],
      });
    }

    await this.client.plugins.clownboard.setEmoji(message.guild, emoji);

    const embed = new SuccessEmbed({
      description: `Successfully set ${emoji} for clownboard emoji.`,
    });

    await message.reply({ embeds: [embed] });
  }
};