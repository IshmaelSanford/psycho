const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "clownboard-set-channel",
      enabled: true,
      syntax: "clownboard-set-channel <#channel>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();

    if (!channel)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.clownboard.setChannel(message.guild, channel);

    const embed = new SuccessEmbed({
      description: `Successfully set ${channel} for clownboard.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
