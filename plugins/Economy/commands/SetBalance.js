const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setbalance",
      aliases: ['setbal'],
      enabled: true,
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    let amount;

    if (user === message.author) {
      amount = parseInt(args[0], 10);
    } else {
      amount = parseInt(args[1], 10);
    }
  
    if (isNaN(amount)) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    
    await this.client.plugins.economy.setBalance(user.id, amount);

    const embed = new SuccessEmbed({
      description: `Successfully set ${user}'s balance to **${this.client.plugins.economy.parseAmount(
        amount
      )}**.`,
    }, message);

    await message.reply({ embeds: [embed] });
  }
};