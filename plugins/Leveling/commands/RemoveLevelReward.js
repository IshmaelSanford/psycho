const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "removelevelreward",
      enabled: true,
      aliases: ['rlr', 'remlr', 'lemlvlr'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "rlr <@role>",
      about: "Remove a level rewards role from the server",
    });
  }
  async execute(message, args) {
    const role = message.mentions.roles.first();

    if (!role) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    await this.client.plugins.leveling.removeLevelRole(message.guild, role);

    const embed = new SuccessEmbed({
      description: `Successfully removed ${role} from rewards.`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
