const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");

module.exports = class RobCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rob",
      aliases: [],
      description: "Attempt to rob another user's wallet.",
      enabled: true,
    });
  }
// add cooldown
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "You must mention a user to rob" }, message)],
      });
    }

    const user_id = message.author.id;
    const target_id = target.id;

    // Check if the target has enough balance to be robbed
    const targetData = this.client.plugins.economy.getData(target_id);
    if (targetData.stats.cash <= 0) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "This user has nothing in their wallet" }, message)],
      });
    }

    // Determine success or failure
    const successRate = 0.3; // 30% success rate, adjust as needed
    const caughtRate = 0.5; // 50% chance to get caught if failed, adjust as needed
    const robAmount = Math.floor(Math.random() * targetData.stats.cash); // Random amount up to the target's total cash

    if (Math.random() < successRate) {
      // Rob was successful
      await this.client.plugins.economy.removeFromBalance(target_id, robAmount);
      await this.client.plugins.economy.addToBalance(user_id, robAmount);
      const embed = new SuccessEmbed({
        description: `You successfully robbed **${robAmount}** from **${target.username}**.`,
      }, message);
      message.reply({ embeds: [embed] });
    } else {
      // Rob failed
      if (Math.random() < caughtRate) {
        // User got caught, apply penalty
        const penaltyAmount = Math.floor(robAmount / 2); // 50% of the attempted rob amount as penalty
        await this.client.plugins.economy.removeFromBalance(user_id, penaltyAmount);
        const embed = new ErrorEmbed({
          description: `You were caught and paid **${penaltyAmount}** as a penalty.`,
        }, message);
        message.reply({ embeds: [embed] });
      } else {
        // User failed but didn't get caught
        const embed = new ErrorEmbed({
          description: `You attempted to rob **${target.username}** but failed.`,
        }, message);
        message.reply({ embeds: [embed] });
      }
    }
  }
};