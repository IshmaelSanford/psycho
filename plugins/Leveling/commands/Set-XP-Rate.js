const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "set-xp-rate",
      enabled: true,
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const rate = parseInt(args[0]);

    if (!rate)
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `Invalid syntax. \nPlease use: \`set-xp-rate (@user) (amount)\``,
          }),
        ],
      });

    await this.client.plugins.leveling.setXPRate(message.guild, rate);

    const embed = new SuccessEmbed({
      description: `Successfully set **${rate}x** to XP rate.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
