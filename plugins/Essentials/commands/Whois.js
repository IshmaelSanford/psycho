const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "whois",
      aliases: [],
      enabled: true,
      syntax: "whois [user]",
      about: "Get information about a user",
      example: "whois @user",
    });
  }

  async execute(message, args) {
    let targetUser;
    if (!args[0]) {
      targetUser = message.member;
    } else {
      targetUser = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    }

    if (!targetUser) {
      return message.reply("User not found.");
    }

    const flags = await targetUser.user.fetchFlags();
    let badgeEmojis = flags.toArray().map(flag => {
      switch (flag) {
        case "HypeSquadOnlineHouse1":
          return "<:bravery:1092545309399326770>";
        case "HypeSquadOnlineHouse2":
          return "<:brillance:1092545310821203998>";
        case "HypeSquadOnlineHouse3":
          return "<:balance:1092545606288945243>";
        case "ActiveDeveloper":
          return "<:activedeveloperbadge:1092545320069636187>";
        case "VerifiedDeveloper":
          return "<:earlyverifiedbotdeveloper:1092545608428036146>";
        case "PremiumEarlySupporter":
          return "<:earlysupporter:1092545312503123969>";
        case "Partner":
          return "<:partner:1092545607236866128>";
        case "BugHunterLevel1":
          return "<:bughunterlv1:1092545609438871653>";
        case "BugHunterLevel2":
          return "<:bughunterlv2:1092545610814595072>";
        case "HypeSquad":
          return "<:hypesquad:1092545315648839750>";
        case "Staff":
          return "<:employee:1092545613020803072>";
        case "CertifiedModerator":
          return "<:moderatorprogramsalumni:1092545317926338620>";
        default:
          return "";
      }
    });

    if (targetUser.user.bot) {
      badgeEmojis.unshift("<:bot:1092545323878068295>");
    }

    if (message.guild.ownerId === targetUser.id) {
      badgeEmojis.unshift("<:serverowner:1092545604929986650>");
    }

    if (targetUser.user.avatar && targetUser.user.avatar.startsWith("a_")) {
      badgeEmojis.push("<:nitro:1092545312079478784>");
    }

    if (targetUser.premiumSinceTimestamp) {
      badgeEmojis.push("<:boost:1092545313924972644>");
    }
    
    const createdAtTimestamp = Math.floor(targetUser.user.createdAt / 1000);
    const joinedAtTimestamp = Math.floor(targetUser.joinedAt / 1000);
    
    const totalRoles = targetUser.roles.cache.size - 1;
    const topRoles = targetUser.roles.cache
      .filter(role => role.name !== "@everyone")
      .sort((a, b) => b.position - a.position)
      .first(7)
      .map(role => role.toString());
    
    if (totalRoles > 7) {
      topRoles.push("**. . .**");
    }
    
    const sortedMembers = message.guild.members.cache
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    
    const joinPosition = [...sortedMembers.values()].indexOf(targetUser) + 1;
    
    const mutualGuilds = this.client.guilds.cache.filter(guild => guild.members.cache.has(targetUser.id)).size;
    
    const member = message.guild.members.cache.get(targetUser.id);
    
    const embed = new DefaultEmbed()
      .setColor(member.displayColor === 0 ? "#23272A" : member.displayColor)
      .setTitle(`${targetUser.user.tag} (${targetUser.id})`)
      .setDescription(`${badgeEmojis.join(" ") || "No badges"}`)
      .addFields(
        { name: `Dates`, value: `**Created**: <t:${createdAtTimestamp}:R>\n**Joined**: <t:${joinedAtTimestamp}:R>`, inline: false },
        { name: `Roles (${totalRoles})`, value: `${topRoles.join(", ") || 'no roles'}`, inline: false },
      )
      .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFooter({ text: `Join position: ${joinPosition} ∙ ${mutualGuilds} mutual servers`});
    
    message.channel.send({ embeds: [embed] });
  }
};