const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  DefaultEmbed,
  SuccessEmbed,
  ErrorEmbed,
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

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
    
    let role = this.client.plugins.boost.getRole(message.member);
    role = message.guild.roles.cache.get(role);

    if (!role)
      return message.reply({ content: "❌ You don't have booster role!" });

    const name = args.join(" ");

    if (!name || name.length > 25)
      return message.reply({
        embeds:
          new ErrorEmbed({
            description: `${message.author.toString()}: **Name too long** try something shorter`,
          }),
      });
    role.edit({ name });

    const embed = new SuccessEmbed({
      description: `Successfully set \`${name}\` for your booster role.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
