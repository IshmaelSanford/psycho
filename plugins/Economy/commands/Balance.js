const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      aliases: ['bal'],
      enabled: false,
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const { stats } = await this.client.plugins.economy.getData(
      message.guild.id,
      user.id
    );

    if (stats.cash < 0) {
      stats.cash = 0;
      this.client.plugins.economy.setBalance(message.guild.id, user.id, 0);
    }

    if (user.id !== message.author.id) {
      if (
        stats.cash > 1000 &&
        this.client.plugins.economy.hasItemInInventory(
          message.guild.id,
          message.author.id,
          "grabber",
          true
        )
      ) {
        const amount = Math.random() * 1000 + 1;
        stats.cash -= amount;

        this.client.plugins.economy.removeFromBalance(
          message.guild.id,
          user.id,
          amount
        );

        this.client.plugins.economy.addToBalance(
          message.guild.id,
          message.author.id,
          amount
        );

        message.reply({
          embeds: [
            new DefaultEmbed({
              description: `You grabbed **$${amount}** from ${user}'s wallet!`,
            }),
          ],
        });
      }

      this.client.plugins.economy.addAchievement(
        message.guild.id,
        message.author.id,
        "nosey",
        100
      );
    }

    const embed = new DefaultEmbed()
      .setAuthor({
        name: `${user.tag}'s wallet`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .addFields([
        {
          name: "💰 Cash",
          value: `$${this.client.plugins.economy.parseAmount(stats.cash)}`,
        },
        {
          name: "🎲 Gambled",
          value: `$${this.client.plugins.economy.parseAmount(stats.gambled)}`,
        },
      ]);
    await message.reply({ embeds: [embed] });
  }
};
