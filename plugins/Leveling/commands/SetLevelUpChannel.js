const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setlevelupchannel",
      enabled: true,
      aliases: ['sluch', 'setluch', 'setlvluch'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "setlevelupchannel <#channel>",
      about: "Set a channel for level up message to go",
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();

    if (!channel)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    await this.client.plugins.leveling.setLevelUpChannel(channel);

    const embed = new SuccessEmbed({
      description: `Successfully set ${channel} for level-up channel.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
