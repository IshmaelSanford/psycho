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

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    function getErrorMessage(error) {
      switch (error.code) {
        case 10062:
          return "This server hasn't unlocked role emojis yet.";
        case 40005:
          return "Emoji is too large!";
        case 10011:
          return "Role doesn't exist anymore.";
        default:
          return "An unknown error occurred.";
      }
    }

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
          new ErrorEmbed({ description: `${message.author.toString()}: You cannot add default emojis!` }),
        ],
      });
    else
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    try {
      await role.edit({ icon: emoji });
    } catch (error) {
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `${message.author.toString()}: ${getErrorMessage(error)}` }),
        ],
      });
    }
    

    const embed = new SuccessEmbed({
      description: `Successfully set icon for your booster role.`,
    });

    await message.reply({ embeds: [embed] });
  }
};
