const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const search = require("wikihow-sr");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "wikihow",
      enabled: true,
    });
  }
  async execute(message, args) {
    const query = args.join(" ");

    if (!query) return message.reply("❌ Wrong syntax. Use: `wikihow <query>`");

    const data = await search(query);

    if (!data) return message.reply("❌ No results found for your query!");

    const embed = new DefaultEmbed()
      .setTitle(data.title)
      .setDescription(data.url);

    await message.reply({ embeds: [embed] });
  }
};
