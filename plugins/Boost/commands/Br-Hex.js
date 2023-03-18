const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  DefaultEmbed,
  WrongSyntaxEmbed,
  SuccessEmbed,
} = require("../../../embeds");

const { resolveColor } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "br-hex",
      enabled: true,
    });
  }
  async execute(message, args) {
    let role = this.client.plugins.boost.getRole(message.member);
    role = message.guild.roles.cache.get(role);

    if (!role)
      return message.reply({ content: "❌ You don't have booster role!" });

    const color = resolveColor(args[0]);

    if (!color)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    role.edit({ color: color });

    const embed = new SuccessEmbed({
      description: `Successfully set color \`${color}\` for your booster role.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
