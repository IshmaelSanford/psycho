const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, WrongSyntaxEmbed, SuccessEmbed, WarnEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "drop-set",
      enabled: true,
      syntax: "drop-set <channel> <frequency_messages>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();
    const frequency = parseInt(args[1]);
    if (!channel || !frequency) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    if (frequency < 2) {
      this.client.plugins.economy.deleteDropChannel(channel.id);

      return message.reply({
        embeds: [
          new WarnEmbed({
            description: `Drops have been removed from ${channel}`,
          },message),
        ],
      });
    }

    this.client.plugins.economy.setDropChannel(channel.id, frequency);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Drops have been set to \`${frequency}\` messages in ${channel}`,
        },message),
      ],
    });
  }
};
