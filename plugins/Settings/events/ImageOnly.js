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

    const channels = this.client.plugins.settings.getImgOnlyList(message.guild);

    if (!channels?.includes(message.channel.id)) return;

    if (message.attachments.size > 0) return;

    await message.delete().catch(() => {});
  }
};
