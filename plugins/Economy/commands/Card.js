const { Command } = require("../../../structures");
const { AttachmentBuilder } = require("discord.js");
const { DefaultEmbed } = require("../../../embeds");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Bold.ttf'), 'GG Sans Bold');
GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Semibold.ttf'), 'GG Sans Semibold');
GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Normal.ttf'), 'GG Sans Normal');



async function createCreditCardImage(targetMember, targetUser, stats) {
  const canvas = createCanvas(640, 400);
  const ctx = canvas.getContext("2d");

  ctx.roundRect = function (x, y, width, height, radius) {
    if (typeof radius === "undefined") {
      radius = 80;
    }
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    return this;
  };

  // Create a more complex gradient background
  const gradient = ctx.createLinearGradient(0, 0, 640, 400);
  gradient.addColorStop(0, "#1a1a1a");
  gradient.addColorStop(0.5, "#0d0d0d");
  gradient.addColorStop(1, "#1a1a1a");

  // Usage
  ctx.fillStyle = gradient; // Set fillStyle to the gradient
  ctx.roundRect(0, 0, 640, 400).fill(); // Fill the rounded rectangle with the gradient

  // Draw the card name image
  const cardNameImage = await loadImage("./assets/images/card-name.png");
  const cardNameAspectRatio = cardNameImage.width / cardNameImage.height;
  const cardNameHeight = 60; // Adjust this value to scale the card name
  const cardNameWidth = cardNameHeight * cardNameAspectRatio;
  ctx.drawImage(cardNameImage, 50, 50, cardNameWidth, cardNameHeight);

  // Draw the chip image
  const chipImage = await loadImage("./assets/images/chip1.png");
  const chipAspectRatio = chipImage.width / chipImage.height;
  const chipHeight = 100;
  const chipWidth = chipHeight * chipAspectRatio;
  ctx.drawImage(chipImage, 490, 150, chipWidth, chipHeight);

  // Draw 4 spaced white dots to represent an RFID
  const dotRadius = 5;
  const dotSpacing = 15;
  const dotsX = 500;
  const dotsY = 270;
  ctx.fillStyle = "#FFFFFF";

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(dotsX + i * (dotRadius * 2 + dotSpacing), dotsY, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  // Draw the wallet icon and cash balance
  const walletIcon = await loadImage("./assets/images/money.png");
  ctx.drawImage(walletIcon, 50, 200, 30, 30);
  ctx.font = "28px 'GG Sans Normal'";
  ctx.fillStyle = "#d4af37";
  const cashText = `${stats.cash}`;
  ctx.fillText(cashText, 90, 225);

  // Draw the bag icon and gambled amount
  const bagIcon = await loadImage("./assets/images/wallet.png");
  ctx.drawImage(bagIcon, 50, 240, 30, 30);
  ctx.font = "28px 'GG Sans Normal'";
  ctx.fillStyle = "#ffffff";
  const gambledText = `${stats.gambled}`;
  ctx.fillText(gambledText, 90, 265);

  // Draw user's avatar
  const avatar = await loadImage(targetUser.displayAvatarURL({ format: 'png' }));
  ctx.beginPath();
  ctx.arc(70, 340, 20, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 50, 320, 40, 40);

  // Draw user's name and discriminator
  ctx.restore();
  ctx.font = "20px 'GG Sans Bold'";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`${targetMember.username}#${targetMember.discriminator}`, 130, 345);

  const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'psy-credit-card.png' });
  return attachment;
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "credit",
      enabled: true,
    });
  }

  async execute(message, args) {
    const targetUser = message.mentions.users.first() || message.author;
    const targetMember = await message.guild.members.fetch(targetUser.id);

    const { stats } = await this.client.plugins.economy.getData(
      message.guild.id,
      targetUser.id
    );

    if (stats.cash < 0) {
      stats.cash = 0;
      this.client.plugins.economy.setBalance(message.guild.id, targetUser.id, 0);
    }

    if (targetUser.id !== message.author.id) {
      if (
        stats.cash > 1000 &&
        this.client.plugins.economy.hasItemInInventory(
          message.guild.id,
          message.author.id,
          "grabber",
          true
        )
      ) {
        const amount = Math.random() * 1000 + 1;
        stats.cash -= amount;

        this.client.plugins.economy.removeFromBalance(
          message.guild.id,
          targetUser.id,
          amount
        );

        this.client.plugins.economy.addToBalance(
          message.guild.id,
          message.author.id,
          amount
        );

        message.reply({
          embeds: [
            new DefaultEmbed({
              description: `You grabbed **$${amount}** from ${targetUser}'s wallet!`,
            }),
          ],
        });
      }

      this.client.plugins.economy.addAchievement(
        message.guild.id,
        message.author.id,
        "nosey",
        100
      );
    }

    const creditCard = await createCreditCardImage(targetMember, targetUser, stats);

    await message.channel.send({ files: [creditCard] });
  }
};
