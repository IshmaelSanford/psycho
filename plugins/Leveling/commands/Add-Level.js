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
      name: "setrolelevel",
      enabled: true,
      permission: 8,
      aliases: ['setlvl'],
      syntax: "setlvl <role> <level>",
      about: 'Add role levels',
      example: 'setrolelevel @level10 10',
    });
  }
  async execute(message, args) {
    const role = message.mentions.roles.first();
    const amount = parseInt(args[1]);

    if (!role || !amount) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    await this.client.plugins.leveling.addLevelRole(
      message.guild,
      role,
      amount
    );

    const embed = new SuccessEmbed({
      description: `Successfully added ${role} on level ${amount}`,
    });

    await message.reply({ embeds: [embed] });
  }
};
