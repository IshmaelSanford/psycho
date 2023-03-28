const { Event } = require("../../../structures/");
const { EmbedBuilder } = require("@discordjs/builders");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageReactionAdd",
      enabled: true,
    });
  }
  async run(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

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

    const threshold = this.client.plugins.starboard.getThreshold(message.guild);

    const originalEmbed = message.embeds[0];

    const description = `${message.content}${message.content.length > 0 ? '\n' : ''}${message.reference && message.referencedMessage ? `<:reply:1087067601542328390> [Replying to ${message.referencedMessage.author.tag}](${message.referencedMessage.url})\n` : ''}`;

    const imageAttachment = message.attachments.find(
      (attachment) => attachment.contentType.startsWith("image/")
    );

    const videoAttachment = message.attachments.find(
      (attachment) => attachment.contentType.startsWith("video/")
    );

    if (users.size >= threshold) {
      const storedMessageId = this.client.plugins.starboard.getMsg(message.id);
    
      if (!storedMessageId) {
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

        if (imageAttachment) {
          embed.setImage(imageAttachment.url);
        }

        let msg;
        if (videoAttachment) {
          await message.guild.channels.cache
            .get(channel)
            ?.send(videoAttachment.url);
        }

        msg = await message.guild.channels.cache
        .get(channel)
        ?.send({
          content: `${reaction.emoji} **# ${threshold}**`,
          embeds: [embed],
        });

      if (!msg) return;

      this.client.plugins.starboard.saveMsg(message.id, msg.id);
    
      } else if (storedMessageId === null) {
        console.error("Invalid storedMessageId:", storedMessageId);
        return;
      } else {
        let starboardMessage;
        try {
          const fetchOptions = { limit: 1 };
          if (typeof storedMessageId === "string" && /^\d+$/.test(storedMessageId)) {
              fetchOptions.around = storedMessageId;
          }
          const starboardMessages = await message.guild.channels.cache
              .get(channel)
              .messages.fetch(fetchOptions);
          starboardMessage = starboardMessages.first();
        } catch (error) {
          console.error("Error fetching starboard message:", error);
        }
    
        if (!starboardMessage) {
          console.error("Starboard message not found, storedMessageId:", storedMessageId);
          return;
        }
    
        const recreatedEmbed = new EmbedBuilder()
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setColor(originalEmbed?.color || (member.displayColor === 0 ? "#23272A" : member.displayColor))
        .setDescription(description.length > 0 ? description : ' ');
      
      if (originalEmbed) {
        if (originalEmbed?.title) {
          recreatedEmbed.setTitle(originalEmbed.title);
        }
      
        if (originalEmbed?.description) {
          recreatedEmbed.setDescription(originalEmbed.description);
        }
      
        if (originalEmbed?.image) {
          recreatedEmbed.setImage(originalEmbed.image.url);
        }
      
        if (originalEmbed?.fields?.length) {
          recreatedEmbed.addFields(originalEmbed.fields);
        }
      } else {
        if (imageAttachment) {
          recreatedEmbed.setImage(imageAttachment.url);
        }
      }
      
      recreatedEmbed.addFields(
        { name: `**#${message.channel.name}**`, value: `[Jump to message](${message.url})` }
      )
      .setTimestamp();
      
        // Update the starboard message with the recreated embed
        if (starboardMessage instanceof require('discord.js').Message) {
          await starboardMessage.edit({
            content: `${reaction.emoji} **# ${users.size}**`,
            embeds: [recreatedEmbed],
          });
        } else {
          console.error("starboardMessage is not an instance of Message:", starboardMessage);
        }
      }
    }
  }
};