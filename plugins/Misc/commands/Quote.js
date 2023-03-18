const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const {
  WrongSyntaxEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "quote",
      enabled: true,
      syntax: "quote <user> <quote>",
      about: 'Quote what someone said',
      example: 'quote @psycho im good bot',
    });
  }
  async execute(message, args) {

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const user = message.mentions.users.first();
    const member = message.guild.members.cache.get(user.id);

    const quote = args.slice(1).join(" ");

    if (!user || !quote)
      return message.reply({
        content: `❌ Arguments missing. Use: \`quote <@user> <text>\``,
      });

    const embed = new DefaultEmbed()
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`***"${quote}"***`)
      .setColor(member.displayColor === 0 ? "#23272A" : member.displayColor)
      .setTimestamp()
      .setFooter({ text: `quoted by ${message.author.username}`});

    await message.channel.send({ embeds: [embed] });

    await message.delete();
  }
};
