const { Command } = require("../../../structures");
const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const { ErrorEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "slots",
      enabled: true,
    });
  }
  async execute(message, args) {
    const bet = parseInt(args[0]);

    if (isNaN(bet)) return message.reply("❌ Bet must be valid number.");

    const { stats } = await this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (bet > stats.cash) {
      return message.reply({
        content: `❌ You don't have enough money in cash.`,
      });
    }

    const fruits = ["🍎", "🍏", "🍓", "🍑", "7️⃣", "🍒", "🍍", "🍇", "🍊"];

    const f1 = fruits[Math.floor(Math.random() * fruits.length)];
    const f2 = fruits[Math.floor(Math.random() * fruits.length)];
    const f3 = fruits[Math.floor(Math.random() * fruits.length)];
    const f4 = fruits[Math.floor(Math.random() * fruits.length)];
    const f5 = fruits[Math.floor(Math.random() * fruits.length)];
    const f6 = fruits[Math.floor(Math.random() * fruits.length)];
    const f7 = fruits[Math.floor(Math.random() * fruits.length)];
    const f8 = fruits[Math.floor(Math.random() * fruits.length)];
    const f9 = fruits[Math.floor(Math.random() * fruits.length)];

    let won = false;
    let multiplier = 0;

    let winRows = [];

    let wins = 0;
    if (f1 === f2 && f2 === f3) {
      winRows.push(1);
      wins++;
      won = true;
    } else if (f4 === f5 && f5 === f6) {
      winRows.push(2);
      wins++;
      won = true;
    } else if (f7 === f8 && f8 === f9) {
      winRows.push(3);
      wins++;
      won = true;
    } else if (f1 === f4 && f4 === f7) {
      winRows.push(11);
      wins++;
      won = true;
    } else if (f2 === f5 && f5 === f8) {
      winRows.push(22);
      wins++;
      won = true;
    } else if (f3 === f6 && f6 === f9) {
      winRows.push(33);
      wins++;
      won = true;
    } else {
      won = false;
    }
    if (wins === 1) multiplier = 9;
    if (wins === 2) multiplier = 27;
    if (wins === 3) multiplier = 81;

    let K = 1;

    if (
      this.client.plugins.economy.hasItemInInventory(
        message.guild.id,
        message.author.id,
        "snake_eyes",
        true
      )
    ) {
      if (Math.random() < 0.00004) {
        K = 2;
      }
    }

    if (won) {
      this.client.plugins.economy.addAchievement(
        message.guild.id,
        message.author.id,
        "excitement",
        100
      );
      const winStreak =
        this.client.plugins.economy.getStat(
          message.guild.id,
          message.author.id,
          "gambling_streak"
        ) + 1;
      this.client.plugins.economy.setStat(
        message.guild.id,
        message.author.id,
        "gambling_streak",
        winStreak
      );
      if (winStreak === 5) {
        this.client.plugins.economy.addAchievement(
          message.guild.id,
          message.author.id,
          "luck_streak",
          500
        );
      }
      this.client.plugins.economy.addToBalance(
        message.guild.id,
        message.author.id,
        bet * (multiplier - 1) * K
      );
      await this.client.plugins.economy.addToGambled(
        message.guild.id,
        message.author.id,
        bet * multiplier
      );
    } else {
      this.client.plugins.economy.setStat(
        message.guild.id,
        message.author.id,
        "gambling_streak",
        0
      );
      await this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        message.author.id,
        bet
      );
      await this.client.plugins.economy.addToGambled(
        message.guild.id,
        message.author.id,
        bet
      );
    }

    message.reply({
      content: `
  
🟦 ${f1}${f2}${f3} 🟦
➡ ${f4}${f5}${f6} ⬅
🟦 ${f7}${f8}${f9} 🟦

${
  won ? "🥳 You've won" : "😡 You've lost"
} **$${this.client.plugins.economy.parseAmount(
        won ? bet * 9 * K : bet
      )}** on this bet.`,
    });
  }
};
