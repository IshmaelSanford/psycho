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

    const reacts = this.client.plugins.settings.getReactList(message.guild);
    for (const { channel, message: text, emoji } of reacts) {
      if (
        message.content.toLowerCase().includes(text.toLowerCase()) &&
        message.channel.id === channel
      ) {
        await message.react(emoji).catch(() => {});
      }
    }
  }
};
