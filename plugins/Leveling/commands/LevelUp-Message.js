const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits, messageLink } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "levelup-message",
      enabled: true,
      syntax: "levelup-message <message>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    let text = args.join(" ");

    if (!text)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.leveling.setLevelUpMessage(message, text);

    const embed = new SuccessEmbed({
      description: `Successfully updated your level-up message.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
