const { Command } = require("../../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ErrorEmbed,
  SuccessEmbed,
  WrongSyntaxEmbed,
} = require("../../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "equip",
      enabled: false,
      syntax: "equip <item_id>",
    });
  }
  async execute(message, args) {
    const item_id = args[0];

    const invItem = this.client.plugins.economy.hasItemInInventory(
      message.guild.id,
      message.author.id,
      item_id
    );

    if (!invItem) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: "You don't have this item in your inventory!",
          }),
        ],
      });
    }

    if (invItem.equipped) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: "You already have this item equipped!",
          }),
        ],
      });
    }

    if (item_id === "old_key") {
      const reward = Math.floor(Math.random() * 100000) + 1;

      this.client.plugins.economy.removeItemFromInventory(
        message.guild.id,
        message.author.id,
        item_id
      );

      this.client.plugins.economy.addToBalance(
        message.guild.id,
        message.author.id,
        reward
      );

      return message.reply({
        embeds: [
          new SuccessEmbed({
            description: `You have opened a crate and found **$${reward}**!`,
          }),
        ],
      });
    }

    if (invItem.type === "role") {
      const storeItem = this.client.plugins.economy
        .getItems(message.guild.id)
        .find((i) => i.store_id === invItem.id);
      message.member.roles.add(storeItem?.item).catch(() => {});
    }

    this.client.plugins.economy.equipItem(
      message.guild.id,
      message.author.id,
      item_id
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully equipped!`,
        }),
      ],
    });
  }
};
