const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, WrongSyntaxEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "drop-create",
      enabled: true,
      syntax: "drop-create <amount> <description>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const amount = parseInt(args[0]);
    const description = args.slice(1).join(" ");

    if (!amount || !description) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    message.delete().catch(() => {});

    this.client.plugins.economy.createDrop(
      message.channel,
      description,
      amount
    );
  }
};
