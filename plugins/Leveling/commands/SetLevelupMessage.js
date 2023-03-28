const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits, messageLink } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setlevelupmessage",
      enabled: true,
      aliases: ['slum', 'setlum'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "setlum <message>",
      about: "Set a levelup message for the server",
    });
  }
  async execute(message, args) {
    let text = args.join(" ");

    if (!text)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    await this.client.plugins.leveling.setLevelUpMessage(message, text);

    const embed = new SuccessEmbed({
      description: `Successfully updated your level-up message.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
