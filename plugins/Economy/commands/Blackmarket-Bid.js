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
      name: "blackmarket-bid",
      enabled: true,
      syntax: "blackmarket-bid <id> [price]",
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

    if (!item_id) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    const item = this.client.plugins.economy.getBlackmarketItem(
      message.guild.id,
      item_id
    );

    if (!item) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "That item does not exist on the blackmarket!",
          }),
        ],
      });
    }

    if (item.seller === message.author.id) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You cannot buy your own item!",
          }),
        ],
      });
    }

    if (item.type === "bin") {
      if (stats.cash < item.price) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "You do not have enough cash to buy this item!",
            }),
          ],
        });
      }

      this.client.plugins.economy.removeBlackmarketItem(
        message.guild.id,
        item.id
      );

      this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        message.author.id,
        item.price
      );

      this.client.plugins.economy.addToBalance(
        message.guild.id,
        item.seller,
        item.price
      );

      this.client.plugins.economy.addItemToInventory(
        message.guild.id,
        message.author.id,
        item.item,
        "item"
      );

      return message.reply({
        embeds: [
          new SuccessEmbed({
            description: `You have successfully bought for **$${this.client.plugins.economy.parseAmount(
              item.price
            )}**!`,
          }),
        ],
      });
    } else if (item.type === "auction") {
      const bid = parseInt(args[1]);

      if (!bid) {
        return message.reply({
          embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
        });
      }

      if (bid < (item.currentBid || item.price)) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `You must bid at least **$${
                item.currentBid || item.price
              }**!`,
            }),
          ],
        });
      }

      if (stats.cash < bid) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "You do not have enough cash to bid on this item!",
            }),
          ],
        });
      }

      if (item.bidder) {
        this.client.plugins.economy.addToBalance(
          message.guild.id,
          item.bidder,
          item.currentBid
        );
      }

      this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        message.author.id,
        bid
      );

      this.client.plugins.economy.setBlackmarketBidder(
        message.guild.id,
        item.id,
        message.author.id,
        bid
      );

      return message.reply({
        embeds: [
          new SuccessEmbed({
            description: `You have successfully bid **$${bid}**!`,
          }),
        ],
      });
    }
  }
};
