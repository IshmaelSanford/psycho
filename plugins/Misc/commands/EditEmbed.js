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
      name: "editembed",
      enabled: true,
      permission: 8,
      aliases: ['ee'],
      syntax: "embedit <url> <message_link>",
      about: 'Edit an existing embed with Discohook',
      example: 'embedit discohook.org/ https://discord.com/channels/000000/000000',
    });
  }

  async execute(message, args) {
    const url = args[0];
    const messageLink = args[1];

    if (!url || !messageLink)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    const messageLinkRegex = /https:\/\/discord.com\/channels\/\d+\/(\d+)\/(\d+)/;
    const match = messageLink.match(messageLinkRegex);

    if (!match)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid message link." }, message)],
      });

    const [, channelId, messageId] = match;
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid channel id." }, message)],
      });

    const msg = await channel.messages.fetch(messageId);

    if (!msg)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid message id." }, message)],
      });

    let res, data;
    try {
      res = await fetch(url);
    } catch (error) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    const base64 = res.url.slice("https://discohook.org/?data=".length);

    try {
      data = JSON.parse(Buffer.from(base64, "base64").toString());
    } catch (error) {
      return await message.editReply({
        embeds: [new ErrorEmbed({ description: `Invalid type of URL!` }, message)],
      });
    }

    if (!data.messages.length || !data.messages[0].data.embeds?.length) {
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `No valid embeds in this message.` }, message),
        ],
      });
    }

    const embeds = data.messages[0].data.embeds;
    let embedss = [];

    for (let embed of embeds) {
      embedss.push(new EmbedBuilder(embed));
    }

    await msg.edit({
      embeds: embedss,
    });

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully edited message!`,
        }, message),
      ],
    });
  }
};