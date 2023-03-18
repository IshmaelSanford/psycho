const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "add-item",
      enabled: true,
      staffOnly: true,
      syntax: "add-item <role> <store_id> <cost> <description>",
    });
  }
  async execute(message, args) {
    const item =
      message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    const store_id = args[1];
    const cost = parseInt(args[2]);
    const description = args.slice(3).join(" ");

    if (!item || !store_id || !cost || !description) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    const items = await this.client.plugins.economy.getItems(message.guild);

    if (items.find((x) => x.store_id === store_id)) {
      return message.reply({
        embeds: [
          new ErrorEmbed(
            "This store ID is already taken. Please choose another one."
          ),
        ],
      });
    }

    await this.client.plugins.economy.addItem(message.guild, {
      item: item.id,
      store_id,
      cost,
      description,
    });

    const embed = new SuccessEmbed({
      description: `Successfully added **Item #${store_id}** to the store.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
