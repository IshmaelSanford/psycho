const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "membercount",
      enabled: true,
      aliases: ['mcount', 'members'],
      syntax: "mcount",
      about: 'See how many members the server has',
      example: 'membercount',
    });
  }
  async execute(message) {
    let bots = message.guild.members.cache.filter((x) => x.user.bot).size;

    const embed = new DefaultEmbed()
      .setDescription(`👥 There are **${message.guild.memberCount - bots} members** in this server`)
      .setColor('#226699');
    await message.channel.send({ embeds: [embed] });
  }
};
