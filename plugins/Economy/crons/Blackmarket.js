const { ChannelType } = require("discord.js");
const { Cron } = require("../../../structures");

module.exports = class extends Cron {
  constructor(client) {
    super(client, {
      enabled: true,
      format: "* * * * *",
    });
  }
  async execute() {
    try {
      for (const [guildId, items] of [
        ...this.client.plugins.economy.blackmarket,
      ]) {
        for (const item of [...items]) {
          if (item.expires < Date.now()) {
            if (item.type === "auction") {
              if (item.bidder) {
                this.client.plugins.economy.addItemToInventory(
                  item.guild,
                  item.bidder,
                  item.item,
                  "item"
                );
                this.client.plugins.economy.addToBalance(
                  item.guild,
                  item.seller,
                  item.currentBid
                );
              } else {
                this.client.plugins.economy.addItemToInventory(
                  item.guild,
                  item.seller,
                  item.item,
                  "item"
                );
              }
            } else if (item.type === "bin") {
              this.client.plugins.economy.addItemToInventory(
                item.guild,
                item.seller,
                item.item,
                "item"
              );
            }
            this.client.plugins.economy.removeBlackmarketItem(
              item.guild,
              item.id
            );
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
};
