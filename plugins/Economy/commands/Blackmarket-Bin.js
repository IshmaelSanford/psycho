const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const ms = require("ms");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "blackmarket-bin",
      enabled: true,
      syntax: "blackmarket-bin <item_id> <price> <duration>",
    });
  }
  async execute(message, args) {
    const { stats } = this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (!stats.mafia) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You must be in the mafia to use the blackmarket!",
          }),
        ],
      });
    }

    const item_id = args[0];
    const price = parseInt(args[1]);
    const duration = ms(args[2] || "x");

    if (!item_id || !price || !duration) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    const invItem = this.client.plugins.economy.hasItemInInventory(
      message.guild.id,
      message.author.id,
      item_id
    );

    if (!invItem) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You do not have this item in your inventory!",
          }),
        ],
      });
    }

    if (price < 1 || price > Number.MAX_SAFE_INTEGER) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You cannot sell an item for less than $1!",
          }),
        ],
      });
    }

    if (duration < ms("5m")) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You cannot sell an item for less than 5 minutes!",
          }),
        ],
      });
    }

    const specialItem = this.client.config.economy.special_items.find(
      (r) => r.id === item_id
    );

    if (!specialItem) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You can only sell special items!",
          }),
        ],
      });
    }

    const binItem = {
      id: this.client.plugins.economy.randomId(),
      item: item_id,
      name: `${specialItem.emoji} ${specialItem.name}`,
      price,
      expires: Date.now() + duration,
      seller: message.author.id,
      type: "bin",
      guild: message.guild.id,
    };

    this.client.plugins.economy.removeItemFromInventory(
      message.guild.id,
      message.author.id,
      item_id
    );

    this.client.plugins.economy.addBlackmarketItem(message.guild.id, binItem);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You have successfully added **${specialItem.name}** to the blackmarket!`,
        }),
      ],
    });
  }
};