const { Command } = require("../../../structures");
const { WarnEmbed } = require("../../../embeds");
const { AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const removebg = require("remove.bg");
const axios = require("axios");

async function removeBackground(inputImageUrl) {
  try {
    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      { image_url: inputImageUrl, size: "auto" },
      {
        headers: {
          "X-Api-Key": process.env.REMOVE_BG_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const outputBuffer = Buffer.from(response.data);
    return new AttachmentBuilder(outputBuffer, { name: "no-background.png" });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to remove background from the image.");
  }
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "removebg",
      aliases: ["nobg", "transparent"],
      enabled: true,
      syntax: "removebg [user|image-link|attachment]",
      about: "Remove the background of a user's profile picture, image link, or attachment",
      example: "removebg @user",
    });
  }

  async execute(message, args) {
    let imageUrl;

    // If a user is mentioned
    if (message.mentions.users.size) {
      imageUrl = message.mentions.users.first().displayAvatarURL({ format: "png", size: 2048 }).replace('webp','png');
    }
    // If an image link is provided
    else if (args[0] && /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i.test(args[0])) {
      imageUrl = args[0];
    }
    // If an attachment is provided
    else if (message.attachments.size) {
      imageUrl = message.attachments.first().url;
    }
    // If no valid input is provided, use the last image sent in the channel
    else {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const imageMessages = messages.filter(msg => msg.attachments.size > 0 || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i.test(msg.content));
      const lastImageMessage = imageMessages.first();

      if (lastImageMessage) {
        imageUrl = lastImageMessage.attachments.size > 0 ? lastImageMessage.attachments.first().url : lastImageMessage.content;
      } else {
        return await message.channel.send({
          embeds: [new WarnEmbed({ description: `Image is not supported` }, message)],
        });
      }
    }

    try {
      const noBackgroundImage = await removeBackground(imageUrl);
      message.reply({ files: [noBackgroundImage] });
    } catch (error) {
      message.channel.send({
        embeds: [new WarnEmbed({ description: `Unsupported image type. Please try another image` }, message)],
      });
    }
  }
};
