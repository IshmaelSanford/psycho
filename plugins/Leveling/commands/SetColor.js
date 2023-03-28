const { Command } = require("../../../structures/");
const { WarnEmbed, SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setrankcardcolor",
      enabled: true,
      aliases: ['setcc'],
      syntax: "setcardcolor <hex_color>",
      about: "Set your rank card color",
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
    
      const resetFlag = args.includes('--reset');

      if (resetFlag) {
        // Reset the user's card color to the default color
        await this.client.plugins.leveling.setUserCardColor(
          message.guild,
          message.author,
          null // or a default color if you prefer
        );
    
        return message.reply({
          embeds: [
            new SuccessEmbed({
              description: "Your rank card color has been reset to the default!",
            }, message),
          ],
        });
      }
    

    const hexColor = args[0];

    if (!hexColor || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexColor)) {
      return message.reply({
        embeds: [
          new WarnEmbed({
            description: "Please provide a valid hex color.",
          }, message),
        ],
      });
    }

    await this.client.plugins.leveling.setUserCardColor(
      message.guild,
      message.author,
      hexColor
    );

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: "Your rank card color has been updated!",
        }, message),
      ],
    });
  }
};
