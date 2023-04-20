const { Command } = require("../../../structures");
const { WarnEmbed } = require("../../../embeds");
const { AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Bold.ttf'), 'GG Sans Bold');
GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Semibold.ttf'), 'GG Sans Semibold');
GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', 'assets', 'fonts', 'gg_sans_Normal.ttf'), 'GG Sans Normal');


function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isColorDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

function adjustColor(color, amount) {
  const colorNum = parseInt(color.slice(1), 16);
  const amountNum = parseInt(amount, 10);

  const R = (colorNum >> 16) & 0xff;
  const G = (colorNum >> 8) & 0xff;
  const B = colorNum & 0xff;

  const newR = Math.max(Math.min(R + amountNum, 255), 0);
  const newG = Math.max(Math.min(G + amountNum, 255), 0);
  const newB = Math.max(Math.min(B + amountNum, 255), 0);

  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}

function colorBrightness(color) {
  const R = parseInt(color.slice(1, 3), 16);
  const G = parseInt(color.slice(3, 5), 16);
  const B = parseInt(color.slice(5, 7), 16);

  return (R * 299 + G * 587 + B * 114) / 1000;
}



async function createBoosterRankCard(client, message, member, xp, level, rank, targetUser) {
  const canvas = createCanvas(800, 700); // Adjust the size for the booster card
  const ctx = canvas.getContext("2d");

  const cardColor = await client.plugins.leveling.getUserCardColor(message.guild, member.user);
  const mainColor = cardColor || "#131313";
  const subColor = cardColor || "#7289DA";
  const transparentColor = hexToRGBA(mainColor, 0.5);
  const textColor = isColorDark(mainColor) ? "#ffffff" : "#3e3e3e";
  const userStatus = await client.plugins.leveling.getUserStatus(message.guild, member.user);
  const prefix = await client.plugins.settings.prefix(message.guild);
  const mainBrightness = colorBrightness(mainColor);
  const isLight = mainBrightness > 127;
  const adjustmentAmount = isLight ? 50 : -50;

  ctx.roundRect = function (x, y, width, height, radius, roundedCorners) {
    if (typeof radius === "undefined") {
      radius = 5;
    }
    if (typeof roundedCorners === "undefined") {
      roundedCorners = { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true };
    }
    this.beginPath();
    this.moveTo(x + (roundedCorners.topLeft ? radius : 0), y);
    this.lineTo(x + width - (roundedCorners.topRight ? radius : 0), y);
    this[roundedCorners.topRight ? "quadraticCurveTo" : "lineTo"](x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - (roundedCorners.bottomRight ? radius : 0));
    this[roundedCorners.bottomRight ? "quadraticCurveTo" : "lineTo"](x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + (roundedCorners.bottomLeft ? radius : 0), y + height);
    this[roundedCorners.bottomLeft ? "quadraticCurveTo" : "lineTo"](x, y + height, x, y + height - radius);
    this.lineTo(x, y + (roundedCorners.topLeft ? radius : 0));
    this[roundedCorners.topLeft ? "quadraticCurveTo" : "lineTo"](x, y, x + radius, y);
    this.closePath();
    return this;
  };

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, mainColor);
  gradient.addColorStop(1, adjustColor(mainColor, adjustmentAmount));

  // Draw background rectangle with gradient and rounded corners
  const cornerRadius = 75; // Adjust this value to modify the rounded corner radius
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, canvas.width, canvas.height, cornerRadius).fill();
  
  // Define boosterImageHeight
  const boosterImageHeight = (2 / 5) * canvas.height;
  const backgroundUrl = await client.plugins.leveling.getUserBackground(message.guild, member.user);

  if (backgroundUrl) {
    try {
      const background = await loadImage(backgroundUrl);

      // Create a clipping region with rounded top corners
      const cornerRadius = 75; // Adjust this value to modify the rounded corner radius
      ctx.save(); // Save the current context state
      ctx.roundRect(0, 0, canvas.width, boosterImageHeight, cornerRadius, { topLeft: true, topRight: true, bottomLeft: false, bottomRight: false }).clip();

      // Draw the booster image inside the clipping region
      ctx.drawImage(background, 0, 0, canvas.width, boosterImageHeight);

      ctx.restore(); // Restore the context state to its previous state
    } catch (error) {
      console.error("Error loading background image:");
    }
  } else {
    ctx.fillStyle = subColor;
    ctx.fillRect(0, 0, canvas.width, boosterImageHeight);
  }

  // Badges get months since boosting
  const boostDuration = targetUser.premiumSince ? (Date.now() - targetUser.premiumSince.getTime()) / (1000 * 60 * 60 * 24 * 30) : 0;
  const boostingMonths = Math.min(Math.floor(boostDuration) + 1, 6); // Maximum 6 months

  // Load the badge images
  const badgeImages = [];
  for (let i = 1; i <= boostingMonths; i++) {
    try {
      const badgeImage = await loadImage(`./assets/images/tier${i}.png`);
      badgeImages.push(badgeImage);
    } catch (error) {
      console.error(`Error loading badge image for month ${i}:`, error);
    }
  }

  // Draw the badges on the right side, across from the user's avatar
  const badgeScaleFactor = 0.12; // Adjust this value to scale the badges
  const av = 175;
  const yOffset = 150;
  badgeImages.forEach((badgeImage, index) => {
    if (badgeImage) {
      const scaledWidth = badgeImage.width * badgeScaleFactor;
      const scaledHeight = badgeImage.height * badgeScaleFactor;
      const badgeX = canvas.width - 110; // Adjust the X position as needed
      const badgeY = 40 + yOffset + av - scaledHeight - index * (scaledHeight + 10);

      ctx.drawImage(badgeImage, badgeX, badgeY, scaledWidth, scaledHeight);
    }
  });

  // Draw user's avatar
  const avatarSize = 175;
  const avatarX = 50;
  const avatarY = boosterImageHeight - avatarSize / 2;

  try {
    const avatar = await loadImage(targetUser.displayAvatarURL({ format: "png", size: 128, dynamic: false }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 15, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } catch (error) {
    console.error("Error loading avatar image:");
  }
  
  // Draw user's status icon
  const status = member.presence.status;
  const statusColor = {
    online: "#43B581",
    idle: "#FAA61A",
    dnd: "#F04747",
    offline: "#747F8D",
  }[status];

  // Update status icon position and size
  const statusIconX = avatarX + avatarSize * 0.8;
  const statusIconY = avatarY + avatarSize * 0.8;
  const statusIconSize = avatarSize * 0.4;

  ctx.beginPath();
  ctx.arc(statusIconX, statusIconY, statusIconSize / 2.5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(statusIconX, statusIconY, statusIconSize / 4, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = statusColor;
  ctx.fill();

  // Draw user's username and discriminator
  const textStartY = avatarY + avatarSize + 100;
  ctx.font = "bold 48px 'GG Sans Bold'";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(targetUser.username, avatarX, textStartY);

  ctx.font = "bold 48px 'GG Sans Bold'";
  ctx.fillStyle = "#3e3e3e";
  ctx.fillText(`#${targetUser.discriminator}`, avatarX + ctx.measureText(targetUser.username).width + 10, textStartY);

  // Calculate the width of username and discriminator text
  const usernameWidth = ctx.measureText(targetUser.username).width;
  const discriminatorWidth = ctx.measureText(`#${targetUser.discriminator}`).width;

  // Draw rep text
  const repText = `+${xp} REP`;
  const repTextX = avatarX + usernameWidth + discriminatorWidth + 30;
  const repTextY = textStartY - 10;

  ctx.font = "24px 'GG Sans Semibold'";
  const repTextWidth = ctx.measureText(repText).width;

  // Draw rep rectangle
  const repRectX = repTextX - 5; // Add a little padding to the left of the text
  const repRectY = repTextY - 22.5; // Adjust the Y position to fit the rectangle
  const repRectWidth = repTextWidth + 10; // Add padding to the right of the text
  const repRectHeight = 30;

  ctx.fillStyle = "#5666F2";
  ctx.roundRect(repRectX, repRectY, repRectWidth, repRectHeight, 10).fill();

  // Draw rep text on top of the rectangle
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(repText, repTextX, repTextY);

  // Custom Status check
  let defaultStatus = `use ${prefix}setmessage to set a custom status message`;
  let customStatus = userStatus || defaultStatus;

  // Draw user's custom status or default message
  ctx.font = "24px 'GG Sans Semibold'";
  ctx.fillStyle = "#3e3e3e";
  ctx.fillText(customStatus, avatarX, textStartY + 50);

  // Calculate XP to current level
  const xpToNextLevel = 5 * (level ** 2) + 50 * level + 100;
  const xpToCurrentLevel = 5 * ((level - 1) ** 2) + 50 * (level - 1) + 100;
  const xpInCurrentLevel = xp - xpToCurrentLevel;

  // Draw XP progress bar
  const progressBarWidth = canvas.width - 100;
  const progressBarHeight = 40;
  const progressBarX = 50;
  const progressBarY = textStartY + 150;

  // Draw progress bar background
  ctx.fillStyle = "#E4E4E4";
  ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 20).fill();

  // Save canvas state
  ctx.save();

  // Set up clipping path
  ctx.beginPath();
  ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 20);
  ctx.clip();

  // Draw progress bar fill
  const xpNeededForCurrentLevel = xpToNextLevel - xpToCurrentLevel;
  const progressWidth = (xpInCurrentLevel / xpNeededForCurrentLevel) * progressBarWidth;
  ctx.fillStyle = subColor;
  //ctx.lineWidth = 2;
  //ctx.strokeStyle = subColor;
  ctx.roundRect(progressBarX, progressBarY, progressWidth, progressBarHeight, 20).fill();

  // Restore canvas state
  ctx.restore();

  // Draw level and rank rectangles
  const padding = 265; // Increase this value to make the rectangles wider
  const levelRectWidth = ctx.measureText(`Level ${level}`).width + padding;
  const rankRectWidth = ctx.measureText(`Rank ${rank}`).width + padding;
  const rectHeight = 50; // Increase the rectangle height
  const rectSpacing = 10; // Spacing between rectangles
  const rectY = progressBarY - rectHeight - 10; // Position the rectangles above the progress bar

  ctx.fillStyle = transparentColor;
  ctx.roundRect(progressBarX, rectY, levelRectWidth, rectHeight, 10).fill();
  ctx.roundRect(progressBarX + progressBarWidth - rankRectWidth - rectSpacing, rectY, rankRectWidth, rectHeight, 10).fill();

  // Draw level and rank text
  ctx.font = "bold 24px 'GG Sans Bold'";
  ctx.fillStyle = "#FFFFFF";

  const levelText = `Level ${level}`;
  const rankText = `Rank ${rank}`;

  const levelTextWidth = ctx.measureText(levelText).width;
  const rankTextWidth = ctx.measureText(rankText).width;

  const levelTextX = progressBarX + (levelRectWidth - levelTextWidth) / 2;
  const rankTextX = progressBarX + progressBarWidth - rankRectWidth - rectSpacing + (rankRectWidth - rankTextWidth) / 2;

  const textY = rectY + (rectHeight / 2) + 8; // 8 is approximately half the height of a 24px font

  ctx.fillText(levelText, levelTextX, textY);
  ctx.fillText(rankText, rankTextX, textY);

  // Draw xpNeededText
  const xpNeededText = `(${xp}/${5 * (level ** 2) + 50 * level + 100})`;
  ctx.font = "24px 'GG Sans Semibold'";
  ctx.fillStyle = cardColor;
  ctx.fillText(xpNeededText, progressBarX + progressBarWidth - ctx.measureText(xpNeededText).width, progressBarY + progressBarHeight + 30);

  // Send the image
  const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'psy-rank-card-boost.png' });
  return attachment;
}



async function createNonBoosterRankCard(client, message, member, xp, level, rank, targetUser) {
  const canvas = createCanvas(800, 700); // Adjust the size for the booster card
  const ctx = canvas.getContext("2d");

  const cardColor = await client.plugins.leveling.getUserCardColor(message.guild, member.user);
  const mainColor = cardColor || "#131313";
  const subColor = cardColor || "#7289DA";
  const transparentColor = hexToRGBA(mainColor, 0.5);
  const textColor = isColorDark(mainColor) ? "#ffffff" : "#3e3e3e";
  const userStatus = await client.plugins.leveling.getUserStatus(message.guild, member.user);
  const prefix = await client.plugins.settings.prefix(message.guild);
  const mainBrightness = colorBrightness(mainColor);
  const isLight = mainBrightness > 127;
  const adjustmentAmount = isLight ? 50 : -50;

  ctx.roundRect = function (x, y, width, height, radius) {
    if (typeof radius === "undefined") {
      radius = 5;
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

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, mainColor);
  gradient.addColorStop(1, adjustColor(mainColor, adjustmentAmount));

  // Draw background rectangle with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  // Define boosterImageHeight
  const boosterImageHeight = (2 / 5) * canvas.height;
  const defaultBackgroundPath = './assets/images/defaultbgimg.jpeg';

  try {
    const backgroundUrl = await client.plugins.leveling.getUserBackground(message.guild, member.user);
    const backgroundImage = backgroundUrl ? await loadImage(backgroundUrl) : await loadImage(defaultBackgroundPath);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, boosterImageHeight);
  } catch (error) {
    console.error("Error loading background image:", error);
    ctx.fillStyle = subColor;
    ctx.fillRect(0, 0, canvas.width, backgroundHeight);
  }

  // Draw user's avatar
  const avatarSize = 175;
  const avatarX = 50;
  const avatarY = boosterImageHeight - avatarSize / 2;

  try {
    const avatar = await loadImage(targetUser.displayAvatarURL({ format: "png", size: 128, dynamic: false }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 15, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } catch (error) {
    console.error("Error loading avatar image:");
  }
  
  // Draw user's status icon
  const status = member.presence.status;
  const statusColor = {
    online: "#43B581",
    idle: "#FAA61A",
    dnd: "#F04747",
    offline: "#747F8D",
  }[status];

  // Update status icon position and size
  const statusIconX = avatarX + avatarSize * 0.8;
  const statusIconY = avatarY + avatarSize * 0.8;
  const statusIconSize = avatarSize * 0.4;

  ctx.beginPath();
  ctx.arc(statusIconX, statusIconY, statusIconSize / 2.5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(statusIconX, statusIconY, statusIconSize / 4, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = statusColor;
  ctx.fill();

  // Draw user's username and discriminator
  const textStartY = avatarY + avatarSize + 100;
  ctx.font = "bold 48px 'GG Sans Bold'";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(targetUser.username, avatarX, textStartY);

  ctx.font = "bold 48px 'GG Sans Bold'";
  ctx.fillStyle = "#3e3e3e";
  ctx.fillText(`#${targetUser.discriminator}`, avatarX + ctx.measureText(targetUser.username).width + 10, textStartY);

  // Calculate the width of username and discriminator text
  const usernameWidth = ctx.measureText(targetUser.username).width;
  const discriminatorWidth = ctx.measureText(`#${targetUser.discriminator}`).width;

  // Draw rep text
  const repText = `+${xp} REP`;
  const repTextX = avatarX + usernameWidth + discriminatorWidth + 30;
  const repTextY = textStartY - 10;

  ctx.font = "24px 'GG Sans Semibold'";
  const repTextWidth = ctx.measureText(repText).width;

  // Draw rep rectangle
  const repRectX = repTextX - 5; // Add a little padding to the left of the text
  const repRectY = repTextY - 22.5; // Adjust the Y position to fit the rectangle
  const repRectWidth = repTextWidth + 10; // Add padding to the right of the text
  const repRectHeight = 30;

  ctx.fillStyle = "#5666F2";
  ctx.roundRect(repRectX, repRectY, repRectWidth, repRectHeight, 10).fill();

  // Draw rep text on top of the rectangle
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(repText, repTextX, repTextY);

  // Calculate XP to current level
  const xpToNextLevel = 5 * (level ** 2) + 50 * level + 100;
  const xpToCurrentLevel = 5 * ((level - 1) ** 2) + 50 * (level - 1) + 100;
  const xpInCurrentLevel = xp - xpToCurrentLevel;

  // Draw XP progress bar
  const progressBarWidth = canvas.width - 100;
  const progressBarHeight = 40;
  const progressBarX = 50;
  const progressBarY = textStartY + 150;

  // Draw progress bar background
  ctx.fillStyle = "#E4E4E4";
  ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 20).fill();

  // Save canvas state
  ctx.save();

  // Set up clipping path
  ctx.beginPath();
  ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 20);
  ctx.clip();

  // Draw progress bar fill
  const xpNeededForCurrentLevel = xpToNextLevel - xpToCurrentLevel;
  const progressWidth = (xpInCurrentLevel / xpNeededForCurrentLevel) * progressBarWidth;
  ctx.fillStyle = subColor;
  //ctx.lineWidth = 2;
  //ctx.strokeStyle = subColor;
  ctx.roundRect(progressBarX, progressBarY, progressWidth, progressBarHeight, 20).fill();

  // Restore canvas state
  ctx.restore();

  // Draw level and rank rectangles
  const padding = 265; // Increase this value to make the rectangles wider
  const levelRectWidth = ctx.measureText(`Level ${level}`).width + padding;
  const rankRectWidth = ctx.measureText(`Rank ${rank}`).width + padding;
  const rectHeight = 50; // Increase the rectangle height
  const rectSpacing = 10; // Spacing between rectangles
  const rectY = progressBarY - rectHeight - 10; // Position the rectangles above the progress bar

  ctx.fillStyle = transparentColor;
  ctx.roundRect(progressBarX, rectY, levelRectWidth, rectHeight, 10).fill();
  ctx.roundRect(progressBarX + progressBarWidth - rankRectWidth - rectSpacing, rectY, rankRectWidth, rectHeight, 10).fill();

  // Draw level and rank text
  ctx.font = "bold 24px 'GG Sans Bold'";
  ctx.fillStyle = "#FFFFFF";

  const levelText = `Level ${level}`;
  const rankText = `Rank ${rank}`;

  const levelTextWidth = ctx.measureText(levelText).width;
  const rankTextWidth = ctx.measureText(rankText).width;

  const levelTextX = progressBarX + (levelRectWidth - levelTextWidth) / 2;
  const rankTextX = progressBarX + progressBarWidth - rankRectWidth - rectSpacing + (rankRectWidth - rankTextWidth) / 2;

  const textY = rectY + (rectHeight / 2) + 8; // 8 is approximately half the height of a 24px font

  ctx.fillText(levelText, levelTextX, textY);
  ctx.fillText(rankText, rankTextX, textY);

  // Draw xpNeededText
  const xpNeededText = `(${xp}/${5 * (level ** 2) + 50 * level + 100})`;
  ctx.font = "24px 'GG Sans Normal'";
  ctx.fillStyle = "#3e3e3e";
  ctx.fillText(xpNeededText, progressBarX + progressBarWidth - ctx.measureText(xpNeededText).width, progressBarY + progressBarHeight + 30);

  // Send the image
  const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'psy-rank-card-boost.png' });
  return attachment;
}



module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "rank",
      enabled: true,
      aliases: ['level', 'lvl'],
      syntax: "level <@user>",
      about: "See a users level on the server",
    });
  }

  async execute(message, args) {
    const levelingEnabled = this.client.plugins.leveling.getLevelingEnabled(message.guild);
    if (!levelingEnabled) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description: "The leveling system is disabled for this server.",
          }, message),
        ],
      });
    }

    const targetUser = message.mentions.users.first() || message.author;
    const targetMember = await message.guild.members.fetch(targetUser.id);

    const isAuthor = targetUser.id === message.author.id;

    const { stats } = await this.client.plugins.leveling.getData(
      message.guild,
      targetUser
    );
    const { xp, level } = stats;

    const rank = await this.client.plugins.leveling.getLeaderboardRank(message.guild, targetUser);

    // Check if the user is a booster
    const isBooster = targetMember.premiumSince;

    // Create the appropriate rank card
    const rankCard = isBooster
      ? await createBoosterRankCard(this.client, message, targetMember, xp, level, rank, isAuthor ? message.author : targetUser)
      : await createNonBoosterRankCard(this.client, message, targetMember, xp, level, rank, isAuthor ? message.author : targetUser);

    //const rankCard = await createBoosterRankCard(this.client, message, targetMember, xp, level, rank, isAuthor ? message.author : targetUser);

    await message.channel.send({ files: [rankCard] });
  }
};
