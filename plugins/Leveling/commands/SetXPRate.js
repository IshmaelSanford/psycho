const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setxprate",
      enabled: false,
      aliases: ['sxpr', 'setxpr'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "setxpr [<2>] [--reset]",
      about: "Set the multiplier of xp on the server",
    });
  }
  async execute(message, args) {
    if (args[0] === "--reset") {
      await this.client.plugins.leveling.resetXPRate(message.guild);

      const embed = new SuccessEmbed({
        description: `Successfully reset XP rate to the default value.`,
      }, message);

      return message.reply({ embeds: [embed] });
    }

    const rate = parseInt(args[0]);

    if (!rate)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    await this.client.plugins.leveling.setXPRate(message.guild, rate);

    const embed = new SuccessEmbed({
      description: `Successfully set **${rate}x** to XP rate.`,
    }, message);

    await message.reply({ embeds: [embed] });
  }
};
