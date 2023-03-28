const { Command } = require("../../../structures/");
const { WarnEmbed, SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setcardmessage",
      enabled: true,
      aliases: ['setcm'],
      syntax: "setmessage <message>",
      about: "Set your custom status message",
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

    const statusMessage = args.join(" ");

    if (!statusMessage || statusMessage.length > 100) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description: "Please provide a valid status message (max 100 characters).",
          }, message),
        ],
      });
    }

    await this.client.plugins.leveling.setUserStatus(
      message.guild,
      message.author,
      statusMessage
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: "Your custom status message has been updated!",
        }, message),
      ],
    });
  }
};
