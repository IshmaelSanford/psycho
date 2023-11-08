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
    const amount = args[0]; // Assuming the first argument is the amount to withdraw
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description:
              `You must specify a valid amount to withdraw`,
          },message),
        ],
      });
    }

    const user_id = message.author.id;
    const success = await this.client.plugins.economy.withdrawFromBank(user_id, parseInt(amount, 10));

    if (success) {
      const embed = new SuccessEmbed({
        description: `You have successfully withdrawn **${amount}** from your bank.`,
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
