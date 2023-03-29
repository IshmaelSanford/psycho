const { Command } = require("../../../structures");
const { AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "glueify",
      enabled: true,
      aliases: ['glue', 'gwooify', 'addgoopls'],
      syntax: "glue <attachment>",
      about: "Glueify an image",
    });
  }

  async execute(message, args) {
    if (!message.attachments.first()) {
      return message.reply("Please attach an image to your message");
    }

    const imageUrl = message.attachments.first().url;
    const baseImage = await loadImage(imageUrl);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    const glueOverlays = [
      './assets/images/glue1.png',
      './assets/images/glue2.png',
      './assets/images/glue3.png',
      './assets/images/glue4.png',
      './assets/images/glue5.png',
      './assets/images/glue6.png',
      './assets/images/glue7.png',
    ];

    const randomIndex = Math.floor(Math.random() * glueOverlays.length);
    const glueOverlay = await loadImage(glueOverlays[randomIndex]);

    ctx.globalAlpha = 1;
    ctx.drawImage(glueOverlay, 0, 0, canvas.width, canvas.height);

    const outputBuffer = canvas.toBuffer();
    const attachment = new AttachmentBuilder(outputBuffer, "i-think-i-just-glued.png");
    const randomTime = (Math.random() * 2 + 1).toFixed(3);

    message.channel.send({
      content: `> ${message.author} **[** Task completed in *${randomTime}* nanoseconds **]**`,
      files: [attachment],
    });
  

    message.delete().catch((error) => {
      console.error("Failed to delete the message:", error);
    });
  }
};
