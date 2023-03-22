const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const urban = require("urban");
const {
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "urbandictionary",
      aliases: ["urban", 'define'],
      enabled: true,
      syntax: "urban <word>",
      about: 'Lookup words on Urban Dictionary',
      example: 'urban psycho',
    });
  }
  async execute(message, args) {
    const query = args.join(" ");

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const data = urban(query);

    if (!data) {
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `Could not find resulsts for \`${query}\`` },message),
        ],
      });
    }

    data.first(function (json) {
      const embed = new DefaultEmbed()
        .setTitle(`Definition: ${json.word}`)
        .setDescription(json.definition)
        .addFields({ name: "Example", value: json.example })
        .setFooter({
          text: `Author: ${json.author} | 👍 ${json.thumbs_up} 👎 ${json.thumbs_down}`,
        });

      message.reply({ embeds: [embed] });
    });
  }
};
