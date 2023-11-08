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
      name: "unequip",
      enabled: false,
      syntax: "unequip <item_id>",
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

    if (!invItem.equipped) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: "You don't have this item equipped!",
          }),
        ],
      });
    }

    if (invItem.type === "role") {
      const storeItem = this.client.plugins.economy
        .getItems(message.guild.id)
        .find((i) => i.store_id === invItem.id);
      message.member.roles.remove(storeItem?.item).catch(() => {});
    }

    this.client.plugins.economy.unequipItem(
      message.guild.id,
      message.author.id,
      item_id
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully unequipped!`,
        }),
      ],
    });
  }
};
