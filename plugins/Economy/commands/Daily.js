const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const moment = require("moment");
const setup = require("moment-duration-format");
setup(moment);

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "daily",
      enabled: true,
    });
  }

  async execute(message, args) {
    let userData = await this.client.plugins.economy.getData(message.author.id);

    // Ensure userData is not undefined and has a cooldowns object
    if (!userData) {
      userData = { cooldowns: { nextDaily: 0 } };
      // Optionally, save the initialized userData back to the database
      // await this.client.plugins.economy.setData(message.author.id, userData);
    } else if (!userData.cooldowns) {
      userData.cooldowns = { nextDaily: 0 };
      // Optionally, save the updated userData back to the database
      // await this.client.plugins.economy.setData(message.author.id, userData);
    }

    if (Date.now() < userData.cooldowns.nextDaily) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: `You need to wait **${moment
              .duration(userData.cooldowns.nextDaily - Date.now())
              .format("d [days] h [hours] m [minutes] s [seconds]")}** before your next claim.`,
          }, message),
        ],
      });
    }

    await this.client.plugins.economy.daily(message.author.id);

    const dailyAmount = this.client.config.economy.daily;
    const formattedAmount = this.client.plugins.economy.parseAmount(
      dailyAmount,
      message.guild.id, 
      message.author.id
    );

    message.channel.send({
      embeds: [
        new SuccessEmbed({
          description: `Claimed daily reward of ${formattedAmount}`,
        }, message),
      ],
    });
  }
};
