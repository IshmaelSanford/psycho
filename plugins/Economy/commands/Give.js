const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "transfer",
      aliases: ['give', 'wire'],
      enabled: true,
      syntax: 'transfer <user> <amount>',
      about: 'Give a user some of your money',
    });
  }

  async execute(message, args) {
    if (args.length < 2) {
      // Assuming you have a WrongSyntaxEmbed or similar
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Incorrect syntax. Usage: transfer <user> <amount>" }, message)],
      });
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "You must mention a user to transfer money to." }, message)],
      });
    }

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Invalid amount specified." }, message)],
      });
    }

    const userData = this.client.plugins.economy.getData(message.author.id);
    if (!userData || !userData.stats || amount > userData.stats.cash) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "You don't have enough money in cash." }, message)],
      });
    }

    try {
      await this.client.plugins.economy.removeFromBalance(message.author.id, amount);
      await this.client.plugins.economy.addToBalance(user.id, amount);
    } catch (error) {
      // Handle potential errors from the economy plugin
      console.error(error);
      return message.reply({
        embeds: [new ErrorEmbed({ description: "An error occurred while transferring money." }, message)],
      });
    }

    const formattedAmount = this.client.plugins.economy.parseAmount(amount, message.guild.id);
    const embed = new SuccessEmbed({
      description: `Successfully wired **${formattedAmount}** to ${user}.`,
    }, message);

    await message.reply({ embeds: [embed] });
  }
};
