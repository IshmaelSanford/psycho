const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "level-ignore-channel",
      enabled: true,
      syntax: "level-ignore-channel <#channel>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();

    if (!channel)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });


    await this.client.plugins.leveling.ignoreChannel(channel);

    const embed = new SuccessEmbed({
      description: `Successfully added ${channel} to channels ignore list.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
