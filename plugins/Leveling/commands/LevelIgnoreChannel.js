const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "levelignorechannel",
      enabled: true,
      aliases: ['lic', 'lich', 'lvligch'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "lic <#channel>",
      about: "Ignore a channel from the leveling system",
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
