const { Command } = require("../../../structures");
const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
} = require("../../../embeds");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "embedcode",
      enabled: true,
      permission: 8,
      aliases: ['embcode', 'embc', 'ec'],
      syntax: "embcode <channel_id> <message_id>",
      about: 'Check an embeds code',
      example: 'embcode 000000 000000',
    });
  }
  async execute(message, args) {
    const channel_id = args[0];
    const message_id = args[1];

    if (!channel_id || !message_id)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    const channel = message.guild.channels.cache.get(channel_id);

    if (!channel)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid channel id." },message)],
      });

    const msg = await channel.messages.fetch(message_id);

    if (!msg)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid message id." },message)],
      });

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `**Message Embed(s):** \`\`\`js\n ${msg.embeds.map((x) =>
            JSON.stringify(x.toJSON(), null, 2)
          )} \n\`\`\``,
        },message),
      ],
    });
  }
};
