const { Command } = require("../../../structures/");
const { WarnEmbed, SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setcurrencyname",
      enabled: true,
      aliases: ['setcr'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "setcurrencyname <name>",
      about: "Set the currency name for your server",
    });
  }

  async execute(message, args) {
    const currencyName = args.join(" ");

    if (!currencyName) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description: "Please provide a valid currency name",
          }, message),
        ],
      });
    }

    await this.client.plugins.economy.setServerCurrencyName(
      message.guild.id,
      currencyName
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: "The server currency name has been updated!",
        }, message),
      ],
    });
  }
};
