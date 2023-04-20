const { Command } = require("../../../structures");
const {
  WarnEmbed,
} = require("../../../embeds");
const { AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

async function createLegofiedImage(inputImageUrl, legoOverlayPath) {
  const input = await loadImage(inputImageUrl);
  const legoOverlay = await loadImage(legoOverlayPath);

  const minDimension = 900;
  const scaleFactor = minDimension / Math.min(input.width, input.height);
  const newWidth = Math.round(input.width * scaleFactor);
  const newHeight = Math.round(input.height * scaleFactor);

  const legoSquareSize = 40;

  const legoSquaresWidth = Math.round(newWidth / legoSquareSize);
  const legoSquaresHeight = Math.round(newHeight / legoSquareSize);

  const overlayWidth = legoSquareSize * legoSquaresWidth;
  const overlayHeight = legoSquareSize * legoSquaresHeight;

  const scaledCanvas = createCanvas(newWidth, newHeight);
  const scaledCtx = scaledCanvas.getContext('2d');

  // Draw a black rectangle as the background for transparent images
  scaledCtx.fillStyle = 'black';
  scaledCtx.fillRect(0, 0, newWidth, newHeight);

  scaledCtx.drawImage(input, 0, 0, newWidth, newHeight);

  const downscaledWidth = legoSquaresWidth;
  const downscaledHeight = legoSquaresHeight;
  const downscaledCanvas = createCanvas(downscaledWidth, downscaledHeight);
  const downscaledCtx = downscaledCanvas.getContext('2d');
  downscaledCtx.drawImage(scaledCanvas, 0, 0, downscaledWidth, downscaledHeight);

  const canvas = createCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(downscaledCanvas, 0, 0, newWidth, newHeight);

  ctx.globalCompositeOperation = 'lighten';
  ctx.drawImage(legoOverlay, 0, 0, overlayWidth, overlayHeight, 0, 0, newWidth, newHeight);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.drawImage(legoOverlay, 0, 0, overlayWidth, overlayHeight, 0, 0, newWidth, newHeight);

  return new AttachmentBuilder(await canvas.encode('png'), { name: 'legofied.png' });
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "legofy",
      aliases: ['lego'],
      enabled: true,
      syntax: "legofy [user|image-link|attachment]",
      about: "Legofy a user's profile picture, image link, or attachment",
      example: "legofy @user",
    });
  }

  async execute(message, args) {
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
  
    const legoOverlayPath = './assets/images/lego-overlay.png';
  
    try {
      const legofiedImage = await createLegofiedImage(imageUrl, legoOverlayPath);
      message.channel.send({ files: [legofiedImage] });
    } catch (error) {
      console.error(error);
      message.reply("Failed to legofy the image. Please try again.");
    }
  }
};