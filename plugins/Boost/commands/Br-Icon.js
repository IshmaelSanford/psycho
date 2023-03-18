const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  DefaultEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
  SuccessEmbed,
} = require("../../../embeds");

const axios = require("axios");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "br-icon",
      enabled: true,
    });
  }
  async execute(message, args) {
    let role = this.client.plugins.boost.getRole(message.member);
    role = message.guild.roles.cache.get(role);

    if (!role)
      return message.reply({ content: "❌ You don't have booster role!" });

    let emoji = args[0]?.trim();

    let id;

    if (emoji?.startsWith("<") && emoji?.endsWith(">")) {
      id = emoji.match(/\d{15,}/g)[0];

      const type = await axios
        .get(`https://cdn.discordapp.com/emojis/${id}.gif `)
        .then((image) => {
          if (image) return "gif";
          else return "png";
        })
        .catch((error) => {
          return "png";
        });

      emoji = `https://cdn.discordapp.com/emojis/${id}.${type}`;
    } else if (emoji?.startsWith("http"))
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `You cannot add default emojis!` }),
        ],
      });
    else
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });

    try {
      await role.edit({ icon: emoji });
    } catch (error) {
      return message.reply(
        "❌ **Error while adding icon to your role:** \n- Your server doesn't unlocked role icon feature. \n- Emoji is too large! \n- Role doesn't exist anymore."
      );
    }

    const embed = new SuccessEmbed({
      description: `Successfully set icon for your booster role.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
