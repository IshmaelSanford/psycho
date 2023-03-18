const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "store",
      enabled: true,
      syntax: "store [page]",
    });
  }
  async execute(message, args) {
    let fields = [];

    const store = this.client.plugins.economy.getItems(message.guild);

    const maxPage = Math.ceil(store.length / 10);

    const page = Math.max(1, Math.min(maxPage, parseInt(args[0]) || 1));

    for (const { item, store_id, cost, description } of store.slice(
      (page - 1) * 10,
      page * 10
    )) {
      const role = message.guild.roles.cache.get(item);
      if (!role) continue;
      fields.push({
        name: `${role.name} OR Store ID: ${store_id}`,
        value: `
        \`-\` Role: <@&${role.id}>
        \`-\` Description: *${description}*
        \`-\` Cost: **__$${this.client.plugins.economy.parseAmount(cost)}__**
        \`-\` Buy with \`buy ${store_id}\`
        `,
      });
    }
    const embed = new DefaultEmbed().setTitle("🛒 Server Store");

    if (!fields.length)
      fields = { name: "No data", value: "❌ No available items." };
    else {
      embed.setFooter({
        text: `Page ${page} of ${maxPage}`,
      });
    }

    embed.addFields(fields);

    message.reply({ embeds: [embed] });
  }
};
