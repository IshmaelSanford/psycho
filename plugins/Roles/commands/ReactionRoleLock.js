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
      name: "reactionrole-lock",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "reactionrole-lock",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    this.client.plugins.roles.reactionRoleLock(message.guild.id);

    await message.reply({
      embeds: [
        new SuccessEmbed({
          description: `Successfully locked all reaction roles.`,
        }),
      ],
    });
  }
};
