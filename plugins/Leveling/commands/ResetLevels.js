const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { PermissionFlagsBits, messageLink } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "resetlevels",
      enabled: true,
      permission: PermissionFlagsBits.Administrator,
      syntax: "resetlevels",
      about: "Reset all leveling data for this server",
    });
  }
  async execute(message, args) {
    try {
      const guildId = message.guild.id;
      const levelingPlugin = this.client.plugins.leveling;
      const levelingData = await levelingPlugin.getAll();

      levelingData.forEach((userData, key) => {
        if (key.startsWith(`${guildId}-`)) {
          levelingPlugin.database.set(key, {
            stats: {
              xp: 0,
              level: 1,
              messages: 0,
            },
            cooldowns: {
              nextMessage: 0,
            },
          });
        }
      });

      const embed = new SuccessEmbed({
        description: "Successfully reset leveling data for this server.",
      }, message);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new ErrorEmbed({
        description: "An error occurred while resetting leveling data.",
      }, message);

      await message.reply({ embeds: [embed] });
    }
  }
};
