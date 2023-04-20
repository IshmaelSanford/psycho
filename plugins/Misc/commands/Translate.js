const { Command } = require("../../../structures");
const { DefaultEmbed, WarnEmbed } = require("../../../embeds");
const ISO6391 = require("iso-639-1");
const translate = require("translate-google");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "translate",
      enabled: true,
      aliases: [],
      syntax: "translate <targetLanguage> <text>",
      about: "Translate text to the specified language",
      example: 'translate es "Hello, how are you?"',
    });
  }

  async execute(message, args) {
    if (args.length < 2) {
      return message.channel.send({
        embeds: [new WarnEmbed({ description: "Please provide a language" }, message)],
      });
    }

    const targetLanguage = ISO6391.getCode(args[0]);
    const text = args.slice(1).join(" ");

    if (!ISO6391.validate(targetLanguage)) {
      return message.channel.send({
        embeds: [new WarnEmbed({ description: `*${args[0]}* is not a valid language` }, message)],
      });
    }

    try {
      translate(text, { to: targetLanguage })
        .then((translation) => {
          const user = message.mentions.users.first() || message.author;
          const member = message.guild.members.cache.get(user.id);

          const embed = new DefaultEmbed()
            .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTitle(`Translating to ${ISO6391.getName(targetLanguage)}`)
            .setDescription(`\`\`\`${translation}\`\`\``)
            .setFooter({ text: `Google Translate`, iconURL: "https://www.google.com/favicon.ico" })
            .setColor(member.displayColor === 0 ? "#0073E6" : member.displayColor);

          return message.channel.send({ embeds: [embed] });
        })
        .catch((error) => {
          console.error(error);
          return message.channel.send({
            embeds: [new WarnEmbed({ description: `*${targetLanguage}* is not a language` }, message)],
          });
        });
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [new WarnEmbed({ description: `An error occurred while translating` }, message)],
      });
    }
  }
};