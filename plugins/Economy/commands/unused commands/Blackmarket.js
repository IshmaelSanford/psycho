const { Command } = require("../../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "blackmarket",
      enabled: false,
      syntax: "blackmarket [page]",
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
            description: "You must be in the mafia to view the blackmarket!",
          },message),
        ],
      });
    }

    const blackmarket = this.client.plugins.economy.getBlackmarket(
      message.guild.id
    );

    const maxPage = Math.ceil(blackmarket.length / 10);
    const page = Math.max(1, Math.min(maxPage, parseInt(args[0]) || 1));

    if (!blackmarket.length) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `There are no items on the blackmarket in this server.`,
          },message),
        ],
      });
    }

    const embed = new DefaultEmbed().setTitle("Blackmarket").setFooter({
      text: `Page ${page} of ${maxPage}`,
    });

    for (const item of blackmarket.slice((page - 1) * 10, page * 10)) {
      const seller = await this.client.users.fetch(item.seller);

      if (item.type === "bin") {
        embed.addFields({
          name: `${item.name} | ID: ${item.id}`,
          value: `**Price:** $${this.client.plugins.economy.parseAmount(
            item.price
          )}\n**Seller:** ${seller.tag}\n**Expires:** <t:${Math.floor(
            item.expires / 1000
          )}:R>`,
          inline: true,
        });
      } else {
        const bidder = item.bidder
          ? (await this.client.users.fetch(item.bidder)).tag
          : "None";
        embed.addFields({
          name: `${item.name} | ID: ${item.id}`,
          value: `**Starting Price:** $${this.client.plugins.economy.parseAmount(
            item.price
          )}\n**Seller:** ${seller.tag}\n**Current Bid:** ${
            item.currentBid
              ? "$" + this.client.plugins.economy.parseAmount(item.currentBid)
              : "None"
          }\n**Bidder:** ${bidder}\n**Expires:** <t:${Math.floor(
            item.expires / 1000
          )}:R>`,
          inline: true,
        });
      }
    }

    message.reply({ embeds: [embed] });
  }
};
