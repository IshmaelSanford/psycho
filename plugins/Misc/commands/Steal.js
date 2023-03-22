const { Command } = require("../../../structures");
const {
  DefaultEmbed,
  WrongSyntaxEmbed,
  SuccessEmbed,
  ErrorEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");
const axios = require("axios");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "steal",
      aliases: ["grab"],
      enabled: true,
      permission: PermissionFlagsBits.ManageEmojisAndStickers,
      syntax: "steal <emoji> [name]",
      about: 'Steal emojis from other servers',
      example: 'steal <:psycho:1086411453050916904>',
    });
  }
  async execute(message, args) {
    let emoji = args[0]?.trim();

    let name = args.slice(1).join(" ").replace(/\s+/g, "_");

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
      return message.channel.send({
        embeds: [
          new ErrorEmbed({ description: `You cannot add default emojis!` },message),
        ],
      });
    else
      return message.channel.send({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    name = name || "unnamed";
    const added = await message.guild.emojis.create({
      attachment: emoji,
      name,
    });

    if (!args[1]) {
      const embed = new DefaultEmbed()
        .setDescription(`🎨 ${message.author.toString()}: What would you like to name ${added}?`)
        .setColor("#d99e82");
      message.channel.send({ embeds: [embed] });

      try {
        const filter = (m) => m.author.id === message.author.id;
        const collected = await message.channel.awaitMessages({
          filter,
          max: 1,
          time: 30000,
          errors: ["time"],
        });

        const response = collected.first();
        name = response.content.replace(/\s+/g, "_");

        await added.setName(name);
      } catch (error) {
        return message.channel.send(
          "No response received within 30 seconds. Command canceled."
        );
      }
    }

    await message.channel.send({
      embeds: [
        new SuccessEmbed({
          description: `Successfully added emoji ${added} with name \`${name}\`!`,
        },message),
      ],
    });
  }
};
