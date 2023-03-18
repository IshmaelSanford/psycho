const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "br-reset",
      enabled: true,
    });
  }
  async execute(message) {
    let role = this.client.plugins.boost.getRole(message.member);
    role = message.guild.roles.cache.get(role);

    if (!role)
      return message.reply({ content: "❌ You don't have booster role!" });

    role.edit({
      name: `${message.member.displayName}'s role`,
      color: null,
      icon: null,
    });

    const embed = new SuccessEmbed({
      description: `Successfully reseted  your booster role.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
