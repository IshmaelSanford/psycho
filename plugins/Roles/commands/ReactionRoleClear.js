const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  WarnEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "reactionrole-clear",
      enabled: true,
      aliases: ['rrclear', 'rrc'],
      permission: PermissionFlagsBits.Administrator,
      example: 'Clear all reaction roles on the server',
      syntax: "reactionrole-clear",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    // Fetch all reaction role messages from the database
    const reactionRoleList = this.client.plugins.roles.getReactionRoleList(message.guild.id);
  
    // Loop through all reaction role messages and remove all reactions from each of them
    reactionRoleList.forEach(async (reactionRole) => {
      try {
        const channel = await this.client.channels.fetch(reactionRole.channel_id);
        const msg = await channel.messages.fetch(reactionRole.message_id);
        await msg.reactions.removeAll();
      } catch (error) {
        console.error(`Error removing reactions from message ${reactionRole.message_id}:`, error);
      }
    });
  
    // Clear all reaction role data from the database
    this.client.plugins.roles.reactionRoleClear(message.guild.id);
  
    // Remove all reactions from the command message
    message.reactions.removeAll().catch(console.error);
  
    await message.channel.send({
      embeds: [
        new WarnEmbed({
          description: `Successfully cleared all reaction roles from database.`,
        }, message),
      ],
    });
  }
};  
