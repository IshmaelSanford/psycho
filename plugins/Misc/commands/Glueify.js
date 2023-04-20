const { Command } = require("../../../structures");
const {
  WarnEmbed,
} = require("../../../embeds");
const { AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

async function createGlueifiedImage(inputImageUrl, glueOverlays) {
  const input = await loadImage(inputImageUrl);

  const minDimension = 400; // Set a minimum dimension for the output image
  const scaleFactor = minDimension / Math.min(input.width, input.height);
  const newWidth = Math.round(input.width * scaleFactor);
  const newHeight = Math.round(input.height * scaleFactor);

  const canvas = createCanvas(newWidth, newHeight);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(input, 0, 0, newWidth, newHeight);

  const randomIndex = Math.floor(Math.random() * glueOverlays.length);
  const glueOverlay = glueOverlays[randomIndex];

  ctx.globalAlpha = 1;
  ctx.drawImage(glueOverlay, 0, 0, newWidth, newHeight);

  return new AttachmentBuilder(await canvas.encode("png"), { name: "glueified.png" });
}
module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "glueify",
      aliases: ['glue', 'gwooify', 'addgoopls'],
      enabled: true,
      syntax: "glueify [user|image-link|attachment]",
      about: "Glueify a user's profile picture, image link, or attachment",
      example: "glueify @user",
    });
  }

  async execute(message, args) {
    const glueOverlayPaths = [
      './assets/images/glue1.png',
      './assets/images/glue2.png',
      './assets/images/glue3.png',
      './assets/images/glue4.png',
      './assets/images/glue5.png',
      './assets/images/glue6.png',
      './assets/images/glue7.png',
    ];

    const glueOverlays = await Promise.all(glueOverlayPaths.map(path => loadImage(path)));

    let imageUrl;
  
    // If a user is mentioned
    if (message.mentions.users.size) {
      imageUrl = message.mentions.users.first().displayAvatarURL({ format: "png" });
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
        return await message.chanel.send({
          embeds: [new WarnEmbed({ description: `Please provide a valid discord **CDN** link` },message)],
        });
      }
    }
  
    try {
      const glueifiedImage = await createGlueifiedImage(imageUrl, glueOverlays);
      const randomTime = (Math.random() * 2 + 1).toFixed(1);
      message.channel.send({ content: `Task completed in ${randomTime} seconds`, files: [glueifiedImage] });
    } catch (error) {
      console.error(error);
      message.reply("Failed to glueify the image. Please try again.");
    }
  }
};