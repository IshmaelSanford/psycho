const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "addxp",
      enabled: true,
      permission: 8,
      syntax: "addxp <user> <xp>",
      about: 'Add role xp to users',
      example: 'addxp @psycho 100',
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || !amount) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `Invalid syntax. \nPlease use: \`add-xp (@user) (amount)\``,
          }),
        ],
      });
    }

    await this.client.plugins.leveling.addXP(message.guild, user, amount);

    let levels = Math.floor(amount / 100);
    if (levels > 0) this.client.plugins.leveling.addLevel(user, levels);

    const embed = new SuccessEmbed({
      description: `Successfully added **${this.client.plugins.economy.parseAmount(
        amount
      )} xp** to ${user}'s profile.`,
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
