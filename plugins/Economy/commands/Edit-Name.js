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
      name: "edit-name",
      enabled: true,
      syntax: "edit-name <store_id> <name>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const store_id = args[0];
    const name = args.slice(1).join(" ");

    if (!store_id) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    if (!name) {
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

    await this.client.plugins.economy.editItemName(
      message.guild.id,
      store_id,
      name
    );

    const embed = new SuccessEmbed({
      description: `**#${store_id} Item** name has been changed to **${name}**.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
