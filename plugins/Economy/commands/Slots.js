const { Command } = require("../../../structures");
const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  WarnEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "slot",
      enabled: true,
      syntax: "slot <amount>",
      about: "Gamble your saving on a slot machine",
    });
  }
  async execute(message, args) {
    if (args.length === 0) {
      return message.channel.send({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Bet must be a valid number" }, message)],
      });
    }

    const { stats } = await this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (bet > stats.cash) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Insufficient funds" }, message)],
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

    if (won) {
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

    const updatedStats = await this.client.plugins.economy.getData(message.guild.id, message.author.id);

    message.reply({
      content: `🟦 ${f1}${f2}${f3} 🟦\n➡️ ${f4}${f5}${f6} ⬅️\n🟦 ${f7}${f8}${f9} 🟦
        ${
          won ? "You've won" : "You've lost"
        } **$${this.client.plugins.economy.parseAmount(
          won ? bet * multiplier * K : bet
        )}** on this bet. Your balance is now **$${this.client.plugins.economy.parseAmount(updatedStats.cash)}**.`,
    });
  }
};
