const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "membercount",
      enabled: true,
      aliases: ['mc', 'members'],
      syntax: "mcount",
      about: 'See how many members the server has',
      example: 'membercount',
    });
  }
  async execute(message) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
    let bots = message.guild.members.cache.filter((x) => x.user.bot).size;
    let users = message.guild.memberCount - bots

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const membersJoinedPastWeek = message.guild.members.cache.filter(
      (m) => m.joinedTimestamp >= oneWeekAgo.getTime()
    ).size;


    const embed = new DefaultEmbed()
      .setAuthor({
        name: `${message.guild.name} statistics`,
        iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        { name: `Users (+${membersJoinedPastWeek})`, value: `${users}`, inline: true },
        { name: "Humans", value: `${message.guild.memberCount}`, inline: true },
        { name: "Bots", value: `${bots}`, inline: true }
      )
      .setColor(member.displayColor === 0 ? "#23272A" : member.displayColor);
    await message.channel.send({ embeds: [embed] });
  }
};
