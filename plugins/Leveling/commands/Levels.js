const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed, WarnEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "levels",
      enabled: true,
      aliases: ['lvls'],
      permission: 8,
      syntax: "lvls [on|off|enable|disable]",
      about: 'Set the leveling system on or off, or toggle it if no argument is provided',
    });
  }
  async execute(message, args) {
    const guild = message.guild;
    const currentStatus = this.client.plugins.leveling.getLevelingEnabled(guild);
    const desiredStatus = args[0];
  
    let shouldEnable;
  
    if (!desiredStatus) {
      shouldEnable = !currentStatus;
    } else if (["on", "enable"].includes(desiredStatus)) {
      shouldEnable = true;
    } else if (["off", "disable"].includes(desiredStatus)) {
      shouldEnable = false;
    } else {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `That looks wrong. Try \`levels on/enable | off/disable\``,
          }, message),
        ],
      });
    }
  
    if (currentStatus === shouldEnable) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description: `Leveling is already set to **${desiredStatus}**.`,
          }, message),
        ],
      });
    }
  
    this.client.plugins.leveling.setLevelingEnabled(guild, shouldEnable);
  
    const newStatus = shouldEnable ? "on" : "off";
    
    const embed = shouldEnable
      ? new SuccessEmbed({
          description: `Leveling system set to **${newStatus}**.`,
        }, message)
      : new ErrorEmbed({
          description: `Leveling system set to **${newStatus}**.`,
        }, message);
  
    await message.channel.send({ embeds: [embed] });
  }
};
