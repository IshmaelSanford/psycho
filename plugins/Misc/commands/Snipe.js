const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "snipe",
      aliases: ["s"],
      enabled: true,
      syntax: "s",
      about: 'Snipe deleted messages',
      example: 'snipe',
    });
  }
  async execute(message) {
    const channelId = message.channel.id;
    const channelSnipes = this.client.snipes.get(channelId) || [];

    const guildSnipesLength = [...this.client.snipes.values()].reduce((acc, snipes) => acc + snipes.length, 0);

    if (channelSnipes.length === 0) {
      const nothingToSnipeEmbed = new DefaultEmbed()
        .setDescription(`🔎 ${message.author.toString()}: No **snipe** found for \`Index: ${guildSnipesLength}\``)
        .setColor("#bcdcf3");
      return message.channel.send({ embeds: [nothingToSnipeEmbed] });
    }

    const snipe = channelSnipes.pop();
    const member = message.guild.members.cache.get(snipe.author.id);
    const timeDifference = Math.abs(Math.round((Date.now() - snipe.createdTimestamp) / 1000));
    const footerText = `Deleted ${timeDifference} seconds ago • ${channelSnipes.length + 1}/${guildSnipesLength} messages`;
    const userIconURL = message.author.displayAvatarURL({ dynamic: true });

    const embed = new DefaultEmbed()
      .setAuthor({
        name: snipe.author.tag,
        iconURL: snipe.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(snipe.content || "No message.")
      .setColor(member.displayColor === 0 ? "#23272A" : member.displayColor)
      .setFooter({ text: footerText, iconURL: userIconURL });

    if (snipe.attachments.first()?.url)
      embed.setImage(snipe.attachments.first()?.url);

    await message.channel.send({ embeds: [embed] });
  }
};
