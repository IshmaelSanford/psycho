const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const {
  WarnEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "banner",
      aliases: ['bn'],
      syntax: "banner [user]",
      example: 'banner @psycho',
      enabled: true,
      about: 'View a user\'s banner',
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    // Fetch the user to access the banner property
    const fetchedUser = await message.client.users.fetch(user.id, { force: true });

    // Check if the fetched user has a banner
    const bannerURL = fetchedUser.bannerURL({ format: 'png', size: 4096, dynamic: true });

    if (!bannerURL) {
      return message.channel.send({
        embeds: [
          new WarnEmbed({ description: `This user doesnt have a **banner**` },message),
        ],
      });
    }

    const embed = new DefaultEmbed()
      .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true, size: 4096 }) })
      .setTitle(`**${user.username}'s banner**`)
      .setURL(bannerURL)
      .setImage(bannerURL)
      .setColor(member.displayColor === 0 ? "#23272A" : member.displayColor);

    await message.channel.send({ embeds: [embed] });
  }
};