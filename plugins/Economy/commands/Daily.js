const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
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
    const { cooldowns } = await this.client.plugins.economy.getData(
      message.author.id
    );
  
    if (Date.now() < cooldowns.nextDaily)
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: `You need to wait **${moment
              .duration(cooldowns.nextDaily - Date.now())
              .format(
                "d [days] h [hours] m [minutes] s [seconds]"
              )}** before your next claim.`,
          }, message),
        ],
      });
  
    await this.client.plugins.economy.daily(message.author.id);
  
    // Use string interpolation to create the formatted amount string
    const dailyAmount = this.client.config.economy.daily;
    const formattedAmount = this.client.plugins.economy.parseAmount(
      dailyAmount,
      message.guild.id, 
      message.author.id
    );
  
    message.channel.send({
      embeds: [
        new SuccessEmbed({
          description: `Claimed daily reward of **${formattedAmount}**`,
        }, message),
      ],
    });
  }
};