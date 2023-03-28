const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed, WarnEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "levelupmessage",
      enabled: true,
      aliases: ['lvlmsgs', 'lm'],
      permission: PermissionFlagsBits.Administrator,
      syntax: "lm [on/enable | off/disable]",
      about: "Enable or disable level up messages in the server",
    });
  }
  async execute(message, args) {
    const guild = message.guild;
    const currentStatus = this.client.plugins.leveling.getLevelUpMessagesStatus(guild);
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
            description: `That looks wrong. Try \`setlevelupmessage on/enable | off/disable\``,
          }, message),
        ],
      });
    }

    if (currentStatus === shouldEnable) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description: `Level-up messages are already set to **${desiredStatus}**.`,
          }, message),
        ],
      });
    }

    this.client.plugins.leveling.setLevelUpMessages(guild, shouldEnable);

    const newStatus = shouldEnable ? "on" : "off";
    const embed = shouldEnable
      ? new SuccessEmbed({
        description: `Level up messages set to **${newStatus}**.`,
      }, message)
    : new ErrorEmbed({
        description: `Level up messages set to **${newStatus}**.`,
      }, message);

    await message.channel.send({ embeds: [embed] });
  }
};
