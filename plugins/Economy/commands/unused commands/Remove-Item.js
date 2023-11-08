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
      name: "remove-item",
      enabled: false,
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const store_id = args[0];

    if (!store_id) {
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

    await this.client.plugins.economy.removeItem(message.guild, store_id);

    const embed = new SuccessEmbed({
      description: `Successfully removed **#${store_id} Item** from the store.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
