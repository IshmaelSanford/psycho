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
      name: "addlevelreward",
      enabled: true,
      permission: 8,
      aliases: ['alr', 'alvlr'],
      syntax: "alr <level> <role>",
      about: 'Add role rewards to levels in the server',
      example: 'alr 5 @level5',
    });
  }
  async execute(message, args) {
    const role = message.mentions.roles.first();
    const amount = parseInt(args[0]);

    if (!role || !amount) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    await this.client.plugins.leveling.addLevelRole(
      message.guild,
      role,
      amount
    );

    const embed = new SuccessEmbed({
      description: `Successfully added ${role} on level ${amount}`,
    },message);

    await message.reply({ embeds: [embed] });
  }
};
