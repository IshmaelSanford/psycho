const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "levelup-channel",
      enabled: true,
      syntax: "levelup-channel <#channel>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const channel = message.mentions.channels.first();

    if (!channel)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    await this.client.plugins.leveling.setLevelUpChannel(channel);

    const embed = new SuccessEmbed({
      description: `Successfully set ${channel} for level-up channel.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
