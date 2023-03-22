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
      name: "starboardsetemoji",
      enabled: true,
      staffOnly: true,
      aliases: ['sse', 'starsetem'],
      syntax: "sse <emoji>",
      about: 'Set the emoji for Starboard',
      example: 'starsetem :star:',
    });
  }
  async execute(message, args) {
    
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const emoji = args[0];

    if (!emoji)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    try {
      await message.react(emoji);
    } catch (error) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid emoji" },message)],
      });
    }

    await this.client.plugins.starboard.setEmoji(message.guild, emoji);

    const embed = new SuccessEmbed({
      description: `Successfully set ${emoji} for starboard emoji.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
