const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      aliases: ['av'],
      syntax: "av [user]",
      example: 'av @psycho',
      enabled: true,
      about: 'View a users avatar',
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
  
    const hasNitro = user.premiumSince;
  
    const serverAvatarURL = hasNitro && user.avatar ? member.displayAvatarURL({ dynamic: true, size: 4096 }) : null;
  
    const avatarURL = serverAvatarURL || user.displayAvatarURL({ dynamic: true, size: 4096 });
  
    const embed = new DefaultEmbed()
      .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTitle(`**${user.username}'s avatar**`)
      .setURL(avatarURL)
      .setImage(avatarURL)
      .setColor(member.displayColor === 0 ? "#23272A" : member.displayColor);
  
    await message.channel.send({ embeds: [embed] });
  }
};
