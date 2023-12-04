const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed, WarnEmbed } = require("../../../embeds");

module.exports = class WithdrawCommand extends Command {
  constructor(client) {
    super(client, {
      name: "withdraw",
      aliases: ['with'],
      description: "Withdraw money from your bank to your wallet.",
      enabled: true,
    });
  }

  async execute(message, args) {
    const user_id = message.author.id;
    let amount = args[0]; // Assuming the first argument is the amount to withdraw

    // Check if the user wants to withdraw everything
    if (amount.toLowerCase() === 'all' || amount.toLowerCase() === 'everything') {
      const userData = await this.client.plugins.economy.getData(user_id);
      amount = userData.stats.bank; // Set amount to total bank balance
    } else if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: `You must specify a valid amount to withdraw`,
          }, message),
        ],
      });
    }

    const success = await this.client.plugins.economy.withdrawFromBank(user_id, parseInt(amount, 10));
    const formattedAmount = this.client.plugins.economy.parseAmount(amount, message.guild.id);

    if (success) {
      const embed = new SuccessEmbed({
        description: `You have successfully withdrawn ${formattedAmount} from your bank.`,
      }, message);
      message.channel.send({ embeds: [embed] });
    } else {
      const embed = new WarnEmbed({
        description: "Insufficient funds",
      }, message);
      message.channel.send({ embeds: [embed] });
    }
  }
};