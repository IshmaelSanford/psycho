const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ErrorEmbed,
  SuccessEmbed,
  WrongSyntaxEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "buy",
      enabled: true,
      syntax: "buy <store_id>",
    });
  }
  async execute(message, args) {
    if (!this.client.plugins.economy.getStore(message.guild)) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `Store is currently disabled.`,
          }),
        ],
      });
    }
    const store_id = args[0];

    if (!store_id) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    const items = this.client.plugins.economy.getItems(message.guild);
    if (!items)
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `There are no items in the store.`,
          }),
        ],
      });

    const item = items.find((x) => x.store_id === store_id);
    if (!item) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `There is no item with the store id of **${store_id}**.`,
          }),
        ],
      });
    }

    const { stats } = await this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (item.cost > stats.cash) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You don't have enough money in cash.`,
          }),
        ],
      });
    }

    if (
      this.client.plugins.economy.hasItemInInventory(
        message.guild.id,
        message.author.id,
        item.store_id
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `You already have this item.`,
          }),
        ],
      });
    }

    this.client.plugins.economy.removeFromBalance(
      message.guild.id,
      message.author.id,
      item.cost
    );

    this.client.plugins.economy.addItemToInventory(
      message.guild.id,
      message.author.id,
      store_id,
      "role"
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Bought the **Item #${store_id}** for **$${this.client.plugins.economy.parseAmount(
            item.cost
          )}**.`,
        }),
      ],
    });
  }
};
