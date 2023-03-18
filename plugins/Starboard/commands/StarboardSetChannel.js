const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setstarboardchannel",
      enabled: true,
      syntax: "setstarboardchannel <#channel>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();

    if (!channel)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.starboard.setChannel(message.guild, channel);

    const embed = new SuccessEmbed({
      description: `Successfully set ${channel} for starboard.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
