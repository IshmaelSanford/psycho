const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  DefaultEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
  SuccessEmbed,
} = require("../../../embeds");
const colorNamer = require("color-namer");

const { resolveColor } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "br-hex",
      enabled: false,
    });
  }

  static isValidColor(color) {
    return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color);
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
  
    const inputColor = args[0];
  
    if (!this.constructor.isValidColor(inputColor)) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `${message.author.toString()}: Wrong notation. Try adding **#** or go [here](https://htmlcolorcodes.com/color-picker/) for help`,
          }),
        ],
      });
    }
  
    const color = resolveColor(inputColor);
  
    role = await role.edit({ color: color });

    const colorName = colorNamer(role.hexColor).html[0].name;

    const embed = new SuccessEmbed({
      description: `${message.author.toString()}: Set color **${colorName}** (\`${role.hexColor}\`) to your booster role`,
    });
  
    await message.reply({ embeds: [embed] });
  }
  
};
