const { DefaultEmbed } = require("../../../embeds");
const { Event } = require("../../../structures");

const { EmbedBuilder } = require("@discordjs/builders");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      name: "guildMemberRemove",
    });
  }
  async run(member) {
    const goodbye = this.client.plugins.settings.getGoodbye(member.guild);
    if (!goodbye || !goodbye.channel || !goodbye.message) return;

    const channel = member.guild.channels.cache.get(goodbye.channel);
    if (!channel) return;

    function replace(text) {
      return text
        .replace(/{user.tag}/g, member.user.tag)
        .replace(/{user.id}/g, member.user.id)
        .replace(/{user}/g, member.user.toString())
        .replace(/{guild}/g, member.guild.name)
        .replace(/{guild.id}/g, member.guild.id)
        .replace(/{guild.memberCount}/g, member.guild.memberCount);
    }

    const embeds = [];

    if (goodbye.message.hasEmbed) {
      const embed = new EmbedBuilder();
      if (goodbye.message.embed.title)
        embed.setTitle(replace(goodbye.message.embed.title));
      if (goodbye.message.embed.description)
        embed.setDescription(replace(goodbye.message.embed.description));
      if (goodbye.message.embed.color)
        embed.setColor(goodbye.message.embed.color);
      if (goodbye.message.embed.thumbnail)
        embed.setThumbnail(goodbye.message.embed.thumbnail);
      embeds.push(embed);
    }

    channel
      .send({
        content: goodbye.message.content
          ? replace(goodbye.message.content)
          : undefined,
        embeds,
      })
      .catch(() => {});
  }
};
