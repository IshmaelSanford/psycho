const { Command } = require("../../../structures");
const { AttachmentBuilder } = require("discord.js");
const { DefaultEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

const userCompatibilities = {};

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "ship",
      aliases: ["compatibility"],
      enabled: true,
      syntax: "ship <user1> [user2]",
      about: 'See the compatibility of two users',
    });
  }

  getCompatibility(user1Id, user2Id) {
    const key = [user1Id, user2Id].sort().join('-');
    if (!userCompatibilities[key]) {
      userCompatibilities[key] = Math.floor(Math.random() * 101); // Ensure it's between 0 and 100
    }
    return Math.min(Math.max(userCompatibilities[key], 0), 100); // Clamp the value between 0 and 100
  }

  getRating(percentage) {
    if (percentage <= 5) return "No Chance Bud 💀";
    if (percentage <= 15) return "Awful 😭";
    if (percentage <= 25) return "Really Poor 😂";
    if (percentage <= 35) return "Below Average 😞";
    if (percentage <= 45) return "Not Great 😿";
    if (percentage <= 50) return "Meh 😐";
    if (percentage <= 59) return "Not Bad 🙄";
    if (percentage === 69) return ";) ♋";
    if (percentage <= 75) return "OK Chance 😏";
    if (percentage <= 80) return "Good 😃";
    if (percentage <= 90) return "Great 🥰";
    if (percentage <= 99) return "Lovers 💘"
    if (percentage === 100) return "PERFECT 💋";
  }

  createProgressBar(percentage) {
    const filledBoxes = Math.round((percentage * 10) / 100);
    const emptyBoxes = 10 - filledBoxes;
    const progressBar = [
      filledBoxes === 0
        ? "<:white_rounded_start:1086135436893753384>"
        : filledBoxes === 1
        ? "<:blue_rounded_start_mid:1086134319048835172>"
        : "<:blue_rounded_start:1086127913180598342>",
      ...Array(filledBoxes - (filledBoxes <= 1 || filledBoxes === 10 ? 1 : 2)).fill("<:blue_box:1086126408193032292>"),
      filledBoxes > 1 && filledBoxes < 10 ? "<:blue_rounded_mid:1086127912303988766>" : "",
      ...Array(Math.max(emptyBoxes - (filledBoxes === 10 ? 1 : 0), 0)).fill("<:white_box:1086126412760612926>"),
      filledBoxes === 10 ? "<:blue_rounded_end:1086127854468735136>" : "<:white_rounded_end:1086127854468735136>",
    ].join("");
    return progressBar;
  }

  async createShipImage(user1, user2, percentage) {
    const canvas = createCanvas(640, 250);
    const ctx = canvas.getContext("2d");

    // Load avatars
    const avatarURL1 = user1.user.premiumSince && user1.user.avatar ? user1.user.displayAvatarURL({ dynamic: true, size: 4096 }) : user1.user.displayAvatarURL({ dynamic: true, size: 4096 });
    const avatarURL2 = user2.user.premiumSince && user2.user.avatar ? user2.user.displayAvatarURL({ dynamic: true, size: 4096 }) : user2.user.displayAvatarURL({ dynamic: true, size: 4096 });    

    const avatar1 = await loadImage(avatarURL1);
    const avatar2 = await loadImage(avatarURL2);

    // Draw rounded avatar1
    ctx.save(); // Save the current state
    ctx.beginPath();
    ctx.arc(150, 100, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar1, 50, 0, 200, 200);
    ctx.restore(); // Restore to the previous state

    // Draw rounded avatar2
    ctx.save(); // Save the current state
    ctx.beginPath();
    ctx.arc(490, 100, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar2, 390, 0, 200, 200);
    ctx.restore(); // Restore to the previous state

    // Determine heart emoji URL based on percentage
    let heartURL;
    if (percentage < 50) {
        heartURL = 'https://em-content.zobj.net/source/twitter/180/broken-heart_1f494.png'; // Broken heart
    } else if (percentage < 100) {
        heartURL = 'https://images.emojiterra.com/twitter/v13.1/512px/2764.png'; // Regular heart
    } else {
        heartURL = 'https://cdn3.emoji.gg/default/twitter/revolving-hearts.png'; // Revolving hearts
    }

    // Draw the heart in the middle
    const heart = await loadImage(heartURL);
    ctx.drawImage(heart, 245, 30, 150, 150); // Adjust the position and size as needed

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'psy-ship.png' });
    return attachment;
  }


  async execute(message, args) {
    let user1 = message.mentions.members.first();
    let user2 = message.mentions.members.size > 1 ? [...message.mentions.members.values()][1] : null;

    if (!user1 && !user2) {
        const members = await message.guild.members.fetch();
        const randomMember = members.random();
        user1 = message.member;
        user2 = randomMember;
    } else if (user1 && !user2) {
        user2 = user1;
        user1 = message.member;
    }

    const percentage = this.getCompatibility(user1.id, user2.id);
    const progressBar = this.createProgressBar(percentage);

    const shipImage = await this.createShipImage(user1, user2, percentage);

    const embed = new DefaultEmbed()
        .setTitle(`🔀 ${user2.displayName}`)
        .setDescription(
            `**${percentage}%** ${progressBar}  ${this.getRating(percentage)}`
        )
        .setColor('#EE82EE')
        .setImage('attachment://psy-ship.png');

    await message.channel.send({ embeds: [embed], files: [shipImage] });
  }
};
