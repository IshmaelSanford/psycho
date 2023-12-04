const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed, WarnEmbed } = require("../../../embeds");

module.exports = class DepositCommand extends Command {
  constructor(client) {
    super(client, {
      name: "deposit",
      aliases: ['dep'],
      description: "Deposit money from your wallet into your bank.",
      enabled: true,
    });
  }

  async execute(message, args) {
    let amount = args[0]; // This could be a specific amount or undefined if not provided

    // Fetch the current wallet balance
    const user_id = message.author.id;
    const userData = await this.client.plugins.economy.getData(user_id);
    const walletBalance = userData.stats.cash;

    // If no amount is provided, use the wallet balance
    if (!amount) {
        amount = walletBalance;
    } else {
        // Parse the amount and check if it's a valid number greater than zero
        amount = parseInt(amount, 10);
        if (isNaN(amount) || amount <= 0) {
            return message.channel.send({
                embeds: [
                  new ErrorEmbed({
                    description: `You must enter a valid amount to deposit.`,
                  }, message),
                ],
            });
        }
        // Check if the user has enough funds to deposit the specified amount
        if (amount > walletBalance) {
            return message.channel.send({
                embeds: [
                  new ErrorEmbed({
                    description: `You can only deposit up to ${this.client.plugins.economy.parseAmount(walletBalance)}.`,
                  }, message),
                ],
            });
        }
    }

    // Proceed with the deposit
    const success = await this.client.plugins.economy.depositToBank(user_id, amount);
    const formattedAmount = this.client.plugins.economy.parseAmount(amount, message.guild.id);

    if (success) {
        const embed = new SuccessEmbed({
            description: `You have successfully deposited ${formattedAmount} into your bank.`,
        }, message);
        message.channel.send({ embeds: [embed] });
    } else {
        const embed = new WarnEmbed({
            description: "There was an error processing your deposit.",
        }, message);
        message.channel.send({ embeds: [embed] });
    }
  }
};