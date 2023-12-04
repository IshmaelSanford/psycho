const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const {
  WarnEmbed,
} = require("../../../embeds");

module.exports = class ServerAvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: "serveravatar",
      aliases: ['sav'],
      syntax: "sav [user]",
      example: 'sav @user',
      enabled: true,
      about: 'View a user\'s server-specific avatar',
    });
  }

  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    // Get the server-specific avatar URL
    const serverAvatarURL = member.displayAvatarURL({ dynamic: true, size: 4096 });

    // Check if the user has a server-specific avatar
    if (member.avatar) {
      const embed = new DefaultEmbed()
        .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTitle(`**${user.username}'s Server Avatar**`)
        .setURL(serverAvatarURL)
        .setImage(serverAvatarURL)
        .setColor(member.displayColor === 0 ? "#23272A" : member.displayColor);

      await message.channel.send({ embeds: [embed] });
    } else {
        await message.channel.send({
          embeds: [
            new WarnEmbed({ description: `${user.username} does not have a server-specific avatar.` },message),
          ],
        });
      }
    }
};
