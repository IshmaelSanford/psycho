const { Event } = require("../../../structures/");
const { EmbedBuilder } = require("@discordjs/builders");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageReactionRemove",
      enabled: true,
    });
  }
  async run(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    if (!reaction.message.content) return;

    const status = this.client.plugins.clownboard.getStatus(
      reaction.message.guild
    );
    if (!status) return;

    const channel = this.client.plugins.clownboard.getChannel(
      reaction.message.guild
    );

    if (!channel) return;

    const emoji = this.client.plugins.clownboard.getEmoji(
      reaction.message.guild
    );

    if (!emoji.includes(reaction.emoji.id) && emoji !== reaction.emoji.name)
      return;

    const message = reaction.message;

    let find;
    if (reaction.emoji.id) find = reaction.emoji.id;
    else find = reaction.emoji.name;

    let reaction1 = await message.reactions.cache.get(
      reaction.emoji.id || reaction.emoji.name
    );
    let users = await reaction1.users.fetch();

    if (!users) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setColor(this.client.plugins.clownboard.getColor(message.guild))
      .setDescription(
        `${message.content}\n\n${message.channel} [Jump to message](${message.url})`
      );

    let msg = await message.guild.channels.cache
      .get(channel)
      .messages.fetch(
        this.client.plugins.clownboard.messages.get(message.id, "embed")
      );

    let timestamp = msg.createdTimestamp;
    embed.setTimestamp(timestamp);

    if (msg)
      msg.edit({
        content: `${reaction.emoji} **# ${users.size}**`,
        embeds: [embed],
      });
  }
};
