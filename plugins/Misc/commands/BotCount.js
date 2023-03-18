const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "botcount",
      enabled: true,
      aliases: ['bots', 'bcount'],
      syntax: "bots",
      about: 'See how many bots are in the server',
      example: 'bots',
    });
  }
  async execute(message) {
    let bots = message.guild.members.cache.filter((x) => x.user.bot).size;

    const embed = new DefaultEmbed()
      .setDescription(`🤖 There are **${bots} bots** in this server`)
      .setColor('#55acee')
    await message.channel.send({ embeds: [embed] });
  }
};
