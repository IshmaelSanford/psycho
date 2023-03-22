const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "levelup-messages-toggle",
      enabled: true,
      staffOnly: true,
    });
  }
  async execute(message, args) {
    let status = this.client.plugins.leveling.getLevelUpMessagesStatus(
      message.guild
    );

    await this.client.plugins.leveling.toggleLevelUpMessages(message.guild);

    const embed = new SuccessEmbed({
      description: `Successfully toggled level-up messages to \`${
        !status === true ? "enabled" : "disabled"
      }\``,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
