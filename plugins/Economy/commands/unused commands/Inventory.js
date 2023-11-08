const { Command } = require("../../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { ErrorEmbed, SuccessEmbed, DefaultEmbed } = require("../../../../embeds");
const Blackjack = require("discord-blackjack");
const { CommandInteraction } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "inventory",
      enabled: false,
      syntax: "inventory [user] [page]",
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const inventory = this.client.plugins.economy.getInventory(
      message.guild.id,
      user.id
    );

    const maxPage = Math.ceil(inventory.length / 10);

    const page = Math.max(1, Math.min(maxPage, parseInt(args[0]) || 1));

    const items = inventory.slice((page - 1) * 10, page * 10);

    if (!inventory.length)
      return message.channel.send({
        embeds: [
          new ErrorEmbed({ description: "This user doesn't have any items." },message),
        ],
      });

    const embed = new DefaultEmbed({
      title: `**${user.username}'s** Inventory`,
    }).setFooter({ text: `Page ${page}/${maxPage}` });
    const storeItems = this.client.plugins.economy.getItems(message.guild.id);

    for (const item of items) {
      if (item.type === "role") {
        const storeItem = storeItems.find((r) => r.store_id === item.id);
        const role = message.guild.roles.cache.get(storeItem?.item);
        embed.addFields({
          name: `Role: ${role?.name || item.id}`,
          value: `Equipped: \`${item.equipped ? "Yes" : "No"}\`\nID: \`${
            item.id
          }\``,
        });
      } else {
        const specialItem = this.client.config.economy.special_items.find(
          (r) => r.id === item.id
        );
        if (!specialItem) continue;
        embed.addFields({
          name: `${specialItem.emoji} ${specialItem.name}`,
          value: `Amount: \`${item.count}\`\nEquipped: \`${
            item.equipped ? "Yes" : "No"
          }\`\nID: \`${item.id}\``,
        });
      }
    }

    message.channel.send({ embeds: [embed] });
  }
};
