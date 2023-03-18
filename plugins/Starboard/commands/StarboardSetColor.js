const { Command } = require("../../../structures");
const { SuccessEmbed, WrongSyntaxEmbed } = require("../../../embeds");
const { PermissionFlagsBits, resolveColor } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "starboard-set-color",
      enabled: true,
      syntax: "starboard-set-color <hex>",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    try {
      resolveColor(args[0]);
    } catch {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    const color = resolveColor(args[0]);

    await this.client.plugins.starboard.setColor(message.guild, color);

    const embed = new SuccessEmbed({
      description: `Successfully set color for starboard.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
