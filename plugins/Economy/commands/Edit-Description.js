const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "edit-description",
      enabled: true,
      syntax: "edit-description <store_id> <name>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const store_id = args[0];
    const description = args.slice(1).join(" ");

    if (!store_id) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    if (!description) {
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
          },message),
        ],
      });
    }

    await this.client.plugins.economy.editItemDescription(
      message.guild.id,
      store_id,
      description
    );

    const embed = new SuccessEmbed({
      description: `**#${store_id} Item** description has been updated.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
