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
      aliases: ['embedit'],
      syntax: "embedit <url> <channel_id> <message_id>",
      about: 'Edit an existing embed with Discohook',
      example: 'embedit discohook.org/ 000000 000000',
    });
  }
  async execute(message, args) {
    const url = args[0];

    const channel_id = args[1];
    const message_id = args[2];

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
        embeds: [new ErrorEmbed({ description: `Invalid type of URL!` })],
      });
    }

    if (!data.messages.length || !data.messages[0].data.embeds?.length) {
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `No valid embeds in this message.` }),
        ],
      });
    }

    if (!channel_id || !message_id)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    const embeds = data.messages[0].data.embeds;

    let embedss = [];

    for (let embed of embeds) {
      embedss.push(new EmbedBuilder(embed));
    }

    const channel = message.guild.channels.cache.get(channel_id);

    if (!channel)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid channel id." })],
      });

    const msg = await channel.messages.fetch(message_id);

    if (!msg)
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid message id." })],
      });

    await msg.edit({
      embeds: embedss,
    });

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully edited message!`,
        }),
      ],
    });
  }
};
