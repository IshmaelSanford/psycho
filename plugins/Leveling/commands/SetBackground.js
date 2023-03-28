const { Command } = require("../../../structures/");
const { WarnEmbed, SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setrankbackground",
      enabled: true,
      aliases: ['setrbg'],
      syntax: "setrankbackground <image_url>",
      about: "Set your rank card background image if you're a server booster",
    });
  }

  async execute(message, args) {
    if (!message.member.premiumSince) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description:
              "This command is only available to server boosters.",
          }, message),
        ],
      });
    }

    const imageUrl = args[0];

    if (!imageUrl) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description: "Please provide a valid image URL.",
          }, message),
        ],
      });
    }

    await this.client.plugins.leveling.setUserBackground(
      message.guild,
      message.author,
      imageUrl
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: "Your rank card background image has been updated!",
        }, message),
      ],
    });
  }
};
