const { Command } = require("../../../structures");
const { AttachmentBuilder } = require("discord.js");
const { DefaultEmbed } = require("../../../embeds");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Bold.ttf'), 'GG Sans Bold');
GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Semibold.ttf'), 'GG Sans Semibold');
GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Normal.ttf'), 'GG Sans Normal');



async function createCreditCardImage(client, message, targetMember, targetUser, stats, isSupporter) {
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
  const dotsX = 502;
  const dotsY = 270;
  ctx.fillStyle = "#FFFFFF";

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(dotsX + i * (dotRadius * 2 + dotSpacing), dotsY, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  // Draw the wallet icon and global cash balance
  const walletIcon = await loadImage("./assets/images/wallet.png");
  ctx.drawImage(walletIcon, 50, 140, 30, 30); // Decreased Y-coordinate
  ctx.font = "28px 'GG Sans Normal'";
  ctx.fillStyle = "#ffffff";
  const globalCash = client.plugins.economy.getTotalGlobalCash(targetUser.id);
  const globalCashText = isNaN(globalCash) ? `0 ${client.config.economy.defaultCurrencyName}` : `${client.plugins.economy.parseAmount(globalCash, null, targetUser.id)}`;
  ctx.fillText(globalCashText, 90, 165); // Decreased Y-coordinate

  // Draw the custom wallet icon for supporters and server cash balance
  const customWalletIcon = await loadImage(isSupporter ? "./assets/images/money.png" : "./assets/images/wallet.png");
  ctx.drawImage(customWalletIcon, 50, 195, 30, 30); // Decreased Y-coordinate
  ctx.font = "28px 'GG Sans Normal'";
  ctx.fillStyle = "#d4af37";
  const customCashText = `${client.plugins.economy.parseAmount(stats.cash, message.guild.id, targetUser.id)}`;
  ctx.fillText(customCashText, 90, 220); // Decreased Y-coordinate

  // Draw the dice icon and gambled amount
  const bagIcon = await loadImage("./assets/images/dice.png");
  ctx.drawImage(bagIcon, 50, 250, 30, 30); // Decreased Y-coordinate
  ctx.font = "28px 'GG Sans Normal'";
  ctx.fillStyle = "#ffffff";
  const gambledText = `${client.plugins.economy.parseAmount(stats.gambled, message.guild.id, targetUser.id)}`;
  ctx.fillText(gambledText, 90, 275); // Decreased Y-coordinate

  // Draw user's avatar
  const avatar = await loadImage(targetUser.displayAvatarURL({ format: 'png' }));
  ctx.beginPath();
  ctx.arc(70, 340, 20, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 50, 320, 40, 40);

  // Draw user's name and discriminator
  ctx.restore();
  ctx.font = "20px 'GG Sans Normal'";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`${targetUser.username}#${targetUser.discriminator}`, 130, 345);

  // Draw "supporter+" text if the user is a supporter
  if (isSupporter) {
    ctx.font = "32px 'GG Sans Normal'";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("supporter+", 130, 375);
  }

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
  
    // Check if the user is a supporter
    const isSupporter = this.client.plugins.economy.isUserSupporter(message.guild.id, targetUser.id);
  
    // Get the custom currency name or use the default one
    const currencyName = await this.client.plugins.economy.getUserCurrencyName(message.guild.id, targetUser.id) || "default_currency_name";

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

    const creditCard = await createCreditCardImage(this.client, message, targetMember, targetUser, stats, isSupporter);

    await message.channel.send({ files: [creditCard] });
  }
};
