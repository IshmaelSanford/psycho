const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "leveltop",
      enabled: true,
      aliases: ['lvltop', 'lvlb'],
      syntax: "lvltop",
      about: 'See the top chatters in the server',
      example: 'leveltop',
    });
  }
  async execute(message, args) {
    const users = await this.client.plugins.leveling.getLeaderboard(
      message.guild,
      25
    );

    const embed = new DefaultEmbed()
      .setAuthor({
        name: `${message.guild.name}'s leveling leaderboard`,
        iconURL: message.guild.iconURL({ dynamic: true }),
      })
      .setDescription("\\🏆 TOP 25 With highest levels");

    let fields = [];
    let index = 1;
    for (let user of users) {
      if (!user) continue;
      let member = message.guild.members.cache.get(user.id);
      if (!member) continue;
      fields.push({
        name: `#${index} ${member.displayName}`,
        value: `level **${user.level}**`,
        inline: true,
      });
      index++;
    }

    embed.setFields(...fields);

    await message.reply({ embeds: [embed] });
  }
};
