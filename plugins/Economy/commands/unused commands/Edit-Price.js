const { Command } = require("../../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "edit-price",
      enabled: false,
      syntax: "edit-price <store_id> <price>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const store_id = args[0];
    const price = parseInt(args[1]);

    if (!store_id) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    if (!price) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    const items = await this.client.plugins.economy.getItems(message.guild);

    if (!items.find((x) => x.store_id === store_id)) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `**#${store_id} Item** does not exist in the store.`,
          }),
        ],
      });
    }

    await this.client.plugins.economy.editItemCost(
      message.guild.id,
      store_id,
      price
    );

    const embed = new SuccessEmbed({
      description: `Changed the price of **#${store_id} Item** to **${price}**`,
    });

    await message.reply({ embeds: [embed] });
  }
};
