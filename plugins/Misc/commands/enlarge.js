const { Command } = require("../../../structures");
const { 
  DefaultEmbed,
  ErrorEmbed,
  WarnEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "enlarge",
      aliases: ['e'],
      syntax: "enlarge <emoji>",
      enabled: true,
      about: 'Enlarge emojis',
    });
  }
    async execute(message, args) {
        if (!args.length) {
            return message.reply({
                embeds: [new ErrorEmbed({ description: "Invalid emoji" }, message)],
              });
        }

        const emoji = args[0];
        const regex = /<a?:\w+:(\d+)>/; // Regex to extract custom emoji ID
        const match = emoji.match(regex);

        if (match) {
            const emojiId = match[1];
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${emoji.startsWith('<a:') ? 'gif' : 'png'}`;
            message.channel.send(emojiUrl);
        } else {
            // Handle standard Unicode emojis (might need an external service)
            message.reply({
                embeds: [new ErrorEmbed({ description: "Cannot enlarge that emoji yet" }, message)],
              });
        }
    }
};
