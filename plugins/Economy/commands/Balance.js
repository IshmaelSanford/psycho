const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      aliases: ['bal'],
      enabled: true,
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const { stats } = await this.client.plugins.economy.getData(user.id);

    if (stats.cash < 0) {
      stats.cash = 0;
      this.client.plugins.economy.setBalance(message.guild.id, user.id, 0);
    }

    if (stats.bank < 0) {
      stats.bank = 0;
    }

    const embed = new DefaultEmbed()
      .setAuthor({
        name: `${user.username}'s wallet`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .addFields([
        {
          name: "**Bank**",
          value: `${this.client.plugins.economy.parseAmount(stats.bank, message.guild.id)}`,
        },
        {
          name: "**Wallet**",
          value: `${this.client.plugins.economy.parseAmount(stats.cash, message.guild.id)}`,
        },
        // global ranking
      ]);
    await message.channel.send({ embeds: [embed] });
  }
};
