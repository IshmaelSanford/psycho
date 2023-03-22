const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  SuccessEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reactionrole-unlock",
      enabled: true,
      syntax: "reactionrole-unlock",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    this.client.plugins.roles.reactionRoleUnlock(message.guild.id);

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully unlocked all reaction roles.`,
        },author),
      ],
    });
  }
};
