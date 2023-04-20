const { Command } = require("../../../structures");
const {
  ErrorEmbed,
} = require("../../../embeds");

function uwuify(text) {
  const replacements = [
    [/r/g, 'w'],
    [/l/g, 'w'],
    [/can/g, 'c-can'],
    [/b/g, 'b-b'],
    [/t/g, 't-t'],
    [/kill/g, 'k-kiww'],
    [/yourself/g, 'youwsewf *notices buldge*'],
    [/sorry/g, 'sowwy *sees buldge*'],
    [/any/g, 'any OwO'],
    [/n([aeiou])/g, 'ny$1'],
    [/N([aeiou])/g, 'Ny$1'],
    [/N([AEIOU])/g, 'NY$1'],
    [/ove/g, 'uv'],
    [/\!+/g, ' >w<']
  ];

  let uwuText = text;
  for (const [pattern, replacement] of replacements) {
    uwuText = uwuText.replace(pattern, replacement);
  }

  return uwuText;
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "uwu",
      enabled: true,
      syntax: "uwu <text>",
      about: "Uwufies the provided text",
      example: "uwu Hello, how are you?",
    });
  }

  async execute(message, args) {
    if (args.length === 0) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({ description: `Please provide **text** as an argument` },message),
        ],
      });
    }

    const inputText = args.join(" ");
    const uwuText = uwuify(inputText);

    message.channel.send(uwuText);
  }
};
