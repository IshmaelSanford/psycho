const { DefaultEmbed } = require("../../../embeds");
const { Event } = require("../../../structures");

const { EmbedBuilder } = require("@discordjs/builders");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      name: "guildMemberAdd",
    });
  }
  async run(member) {
    const welcome = this.client.plugins.settings.getWelcome(member.guild);
    if (!welcome || !welcome.channel || !welcome.message) return;

    const channel = member.guild.channels.cache.get(welcome.channel);
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

    if (welcome.message.hasEmbed) {
      const embed = new EmbedBuilder();
      if (welcome.message.embed.title)
        embed.setTitle(replace(welcome.message.embed.title));
      if (welcome.message.embed.description)
        embed.setDescription(replace(welcome.message.embed.description));
      if (welcome.message.embed.color)
        embed.setColor(welcome.message.embed.color);
      if (welcome.message.embed.thumbnail)
        embed.setThumbnail(welcome.message.embed.thumbnail);
      embeds.push(embed);
    }

    channel
      .send({
        content: welcome.message.content
          ? replace(welcome.message.content)
          : undefined,
        embeds,
      })
      .catch(() => {});
  }
};
