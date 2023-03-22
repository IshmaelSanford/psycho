const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "remove-xp",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("remove-xp")
        .setDescription("Remove xp")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((user) =>
          user.setName("user").setDescription("User").setRequired(true)
        )
        .addNumberOption((num) =>
          num
            .setName("amount")
            .setDescription("Amount")
            .setMinValue(1)
            .setRequired(true)
        ),
    });
  }
  async execute(message, args) {
    await interaction.deferReply({ ephemeral: false });

    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || !amount) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `Invalid syntax. \nPlease use: \`remove-xp (@user) (amount)\``,
          }),
        ],
      });
    }

    await this.client.plugins.leveling.removeXP(message.guild, user, amount);

    let levels = Math.floor(amount / 100);
    if (levels > 0) this.client.plugins.leveling.removeLevel(user, levels);

    const embed = new SuccessEmbed({
      description: `Successfully removed **${this.client.plugins.economy.parseAmount(
        amount
      )} xp** from ${user}'s profile.`,
    },message);

    await interaction.editReply({ embeds: [embed] });
  }
};
