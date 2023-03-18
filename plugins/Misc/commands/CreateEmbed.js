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
      name: "createembed",
      enabled: true,
      permission: 8,
      aliases: ['embcreate'],
      syntax: "embcreate <url>",
      about: 'Create an embed using Discohook',
      example: 'embcreate discohook.org/',
    });
  }
  async execute(message, args) {
    const url = args[0];

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

    const embeds = data.messages[0].data.embeds;

    let embedss = [];

    for (let embed of embeds) {
      embedss.push(new EmbedBuilder(embed));
    }

    await message.channel.send({
      embeds: embedss,
    });

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully imported __**${embeds.length}**__ embeds from your link!`,
        }),
      ],
    });
  }
};
