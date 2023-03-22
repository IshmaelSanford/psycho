const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  DefaultEmbed,
  SuccessEmbed,
  ErrorEmbed,
} = require("../../../embeds");

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
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `${message.author.toString()}: You haven't **boosted** this server` }),
        ],
      });

    if (role.color === 0 && role.icon === null && role.name === `${message.member.displayName}'s role`) {
      return message.reply({
        embeds: [
          new ErrorEmbed({ description: `${message.author.toString()}: You already have the **default** role` }),
        ],
      });
    }

    role.edit({
      name: `${message.member.displayName}'s role`,
      color: 0,
      icon: null,
    });

    const embed = new SuccessEmbed({
      description: `${message.author.toString()}: Successfully **reseted** your booster role`,
    });

    await message.reply({ embeds: [embed] });
  }
};
