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

    const status = this.client.plugins.starboard.getStatus(
      reaction.message.guild
    );
    if (!status) return;

    const channel = this.client.plugins.starboard.getChannel(
      reaction.message.guild
    );

    if (!channel) return;

    const emoji = this.client.plugins.starboard.getEmoji(
      reaction.message.guild
    );

    if (!emoji.includes(reaction.emoji.id) && emoji !== reaction.emoji.name)
      return;

      const message = reaction.message;

      const member = await reaction.message.guild.members.fetch(message.author.id);
      
      // Fetch the referenced message if there is one
      if (message.reference) {
          try {
              message.referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
          } catch (error) {
              console.error("Error fetching the referenced message:", error);
          }
      }

    let find;
    if (reaction.emoji.id) find = reaction.emoji.id;
    else find = reaction.emoji.name;

    let reaction1 = await message.reactions.cache.get(
      reaction.emoji.id || reaction.emoji.name
    );
    let users = await reaction1.users.fetch();

    const originalEmbed = message.embeds[0];

    const description = `${message.content}${message.content.length > 0 ? '\n' : ''}${message.reference && message.referencedMessage ? `<:reply:1087067601542328390> [Replying to ${message.referencedMessage.author.tag}](${message.referencedMessage.url})\n` : ''}`;

    const embed = new EmbedBuilder()
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setColor(originalEmbed?.color || (member.displayColor === 0 ? "#23272A" : member.displayColor))
        .setDescription(description.length > 0 ? description : ' ');

    if (originalEmbed?.title) {
        embed.setTitle(originalEmbed.title);
    }

    if (originalEmbed?.description) {
        embed.setDescription(originalEmbed.description);
    }

    if (originalEmbed?.image) {
        embed.setImage(originalEmbed.image.url);
    }

    if (originalEmbed?.fields?.length) {
        embed.addFields(originalEmbed.fields);
    }

    embed.addFields(
            { name: `**#${message.channel.name}**`, value: `[Jump to message](${message.url})` }
        )
        .setTimestamp();

    let msg = await message.guild.channels.cache
      .get(channel)
      .messages.fetch(
        this.client.plugins.starboard.messages.get(message.id, "embed")
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
