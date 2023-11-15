const { Command } = require("../../../structures");
const { WarnEmbed, SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setcurrencyemoji",
      enabled: true,
      aliases: ['setce'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "setcurrencyemoji <emoji>",
      about: "Set the currency emoji for your server",
    });
  }

  async execute(message, args) {
    const currencyEmoji = args[0];

    // Regular expression to match custom and standard emojis
    const emojiRegex = /<a?:\w+:\d+>|\p{Emoji}/u;


    // Check if the first argument is a valid emoji
    if (!currencyEmoji || !emojiRegex.test(currencyEmoji)) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description: "Please provide a valid emoji",
          }, message),
        ],
      });
    }

    // Save the emoji as the currency symbol for the server
    await this.client.plugins.economy.setServerCurrencyName(
      message.guild.id,
      currencyEmoji,
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `The server currency emoji has been updated to ${currencyEmoji}`,
        }, message),
      ],
    });
  }
};