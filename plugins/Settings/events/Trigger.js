const { Event } = require("../../../structures/");
const { ChannelType, PermissionFlagsBits } = require("discord.js");
const { DefaultEmbed, SuccessEmbed, ErrorEmbed } = require("../../../embeds");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageCreate",
      enabled: true,
    });
  }
  async run(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const triggers = this.client.plugins.settings.getTriggers(message.guild);

    for (const { trigger, response } of triggers) {
      if (message.content.toLowerCase().includes(trigger.toLowerCase())) {
        message.reply(response);
      }
    }
  }
};
