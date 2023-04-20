const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const { getColorFromURL } = require("color-thief-node");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "serverinfo",
      aliases: ["si"],
      enabled: true,
      syntax: "serverinfo",
      about: "Display information about the server",
    });
  }

  async execute(message) {
    const guild = message.guild;
    const owner = await guild.fetchOwner();
    await guild.channels.fetch();

    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter((member) => member.user.bot).size;
    const humanCount = totalMembers - botCount;

    const textChannels = guild.channels.cache.filter((channel) => channel.type === 0 || channel.type === 5 || channel.type === 15).size;
    const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 2 || channel.type === 13).size;
    const categoryChannels = guild.channels.cache.filter((channel) => channel.type === 4).size;
    
    const verificationLevels = ["None", "Low", "Medium", "High", "Very High"];
    const verificationLevel = verificationLevels[guild.verificationLevel];
    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount;

    const roleCount = guild.roles.cache.size;
    const emojiCount = guild.emojis.cache.size;
    const stickerCount = guild.stickers.cache.size;

    let color;

    try {
      color = await getColorFromURL(guild.iconURL({ dynamic: true }));
    } catch (err) {
      console.error(`Error while processing image: ${err.message}`);
      color = "#23272A";
    }

    const embed = new DefaultEmbed()
      .setColor(color)
      .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`Server created on <t:${Math.floor(guild.createdTimestamp / 1000)}:D> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)\nServer is on bot shard ID, ${message.guild.shardId}/4`)
      .addFields(
        { name: "**Owner**", value: `${owner.user.tag}`, inline: true },
        { name: "**Members**", value: `**Total:** ${totalMembers}\n**Humans:** ${humanCount}\n**Bots:** ${botCount}`, inline: true },
        { name: "**Information**", value: `**Verification:** ${verificationLevel}\n**Level:** ${boostLevel}\n**Boosts:** ${boostCount}`, inline: true },
        { name: "**Design**", value: `**Banner:** ${guild.bannerURL({ size: 4096 }) ? `[Click here](${guild.bannerURL({ size: 4096 })})` : "n/a"}\n**Splash:** ${guild.splashURL({ size: 4096 }) ? `[Click here](${guild.splashURL({ size: 4096 })})` : "n/a"}\n**Icon:** ${guild.iconURL({ size: 4096 }) ? `[Click here](${guild.iconURL({ size: 4096 })})` : "n/a"}`, inline: true },
        { name: `**Channels (${textChannels + voiceChannels + categoryChannels})**`, value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Category:** ${categoryChannels}`, inline: true },
        { name: "**Counts**", value: `**Roles:** ${roleCount}\n**Emojis:** ${emojiCount}\n**Stickers:** ${stickerCount}`, inline: true },
        { name: "**Features**", value: `\`\`\`${guild.features.join(", ")}\`\`\``, inline: false },
      )
      .setFooter({ text: `Guild ID: ${guild.id}`})
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};