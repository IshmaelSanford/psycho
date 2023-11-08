const { Command } = require("../../../structures");
const { DefaultEmbed, WarnEmbed, ErrorEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "channelinfo",
      aliases: ["ci"],
      enabled: true,
      syntax: "channelinfo <channel_name/channel_id/channel_mention>",
      about: "Display information about a specific channel",
    });
  }

  async execute(message, args) {
    let channel;

    if (args.length < 1) {
        channel = message.channel;
    } else {
        const input = args.join(" ");
        channel = message.guild.channels.cache.find(
            (c) => c.name.toLowerCase() === input.toLowerCase() || c.id === input || c.toString() === input
        );

        if (!channel) {
            return message.channel.send({ embeds: [new ErrorEmbed({ description: "Channel not found. Provide name, id, or mention" }, message)] });
        }
    }

    const embed = new DefaultEmbed()
      .setTitle(channel.name)
      .setDescription(`Channel created on <t:${Math.floor(channel.createdTimestamp / 1000)}:D> (<t:${Math.floor(channel.createdTimestamp / 1000)}:R>)`)
      .addFields(
        { name: "**Channel ID**", value: channel.id, inline: true },
        { name: "**Type**", value: `${channel.type}`, inline: true },
        { name: "**Position**", value: `${channel.position}`, inline: true },
        { name: "**Parent**", value: channel.parent ? channel.parent.name : "None", inline: true },
      )
      .setTimestamp();

    if (channel.type === "GUILD_TEXT") {
      embed.addFields(
        { name: "**Topic**", value: `${channel.topic ? channel.topic : "None"}` },
        { name: "**NSFW**", value: channel.nsfw ? "Yes" : "No" },
      );
    }

    if (channel.type === "GUILD_VOICE") {
      embed.addField("**User limit**", channel.userLimit > 0 ? channel.userLimit : "Unlimited");
      embed.addField("**Bitrate**", `${channel.bitrate / 1000} kbps`);
    }

    message.channel.send({ embeds: [embed] });
  }
};