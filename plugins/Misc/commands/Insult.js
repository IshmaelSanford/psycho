const { Command } = require("../../../structures");
const {
  ErrorEmbed,
} = require("../../../embeds");

const insults = [
  "{user}, you must have been born on a highway, because that's where most accidents happen.",
  "{user}, I'd agree with you, but then we'd both be wrong.",
  "{user}, if I had a face like yours, I'd sue my parents.",
  "{user}, your family tree must be a cactus because everybody on it is a prick.",
  "{user}, you're not the dumbest person on earth, but you better hope they don't die.",
  "{user}, you're so fake, Barbie is jealous.",
  "{user}, I guess you prove that even god makes mistakes sometimes."
];

function getRandomInsult() {
  return insults[Math.floor(Math.random() * insults.length)];
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "insult",
      enabled: true,
      syntax: "insult <user>",
      about: "Sends an insulting message using the mentioned user's username",
      example: "insult @user",
    });
  }

  async execute(message, args) {
    if (!message.mentions.users.size) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({ description: `Please provide a **user** in the args` },message),
        ],
      });
    }

    const mentionedUser = message.mentions.users.first();
    const insult = getRandomInsult().replace("{user}", mentionedUser.username);

    message.channel.send(insult);
  }
};
