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
      name: "remove-level",
      enabled: true,
      syntax: "remove-level <role>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const role = message.mentions.roles.first();

    if (!role) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    await this.client.plugins.leveling.removeLevelRole(message.guild, role);

    const embed = new SuccessEmbed({
      description: `Successfully removed ${role} from rewards.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
