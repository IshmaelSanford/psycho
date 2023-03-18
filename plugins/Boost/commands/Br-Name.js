const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  DefaultEmbed,
  SuccessEmbed,
  WrongSyntaxEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "br-name",
      enabled: true,
    });
  }
  async execute(message, args) {
    let role = this.client.plugins.boost.getRole(message.member);
    role = message.guild.roles.cache.get(role);

    if (!role)
      return message.reply({ content: "❌ You don't have booster role!" });

    const name = args.join(" ");

    if (!name || name.length > 25)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    role.edit({ name });

    const embed = new SuccessEmbed({
      description: `Successfully set \`${name}\` for your booster role.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
