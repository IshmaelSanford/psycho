const ms = require("ms");
const { Event } = require("../../../structures/");
const {
  DefaultEmbed,
  SuccessEmbed,
} = require("../../../embeds");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageCreate",
      enabled: true,
    });
  }
  async run(message) {
    if (!message.author) return;
    if (message.author.bot) return;
    if (!message.guild) return;

    if (
      message.content.startsWith(
        `${this.client.plugins.settings.prefix(message.guild)}afk`
      )
    )
      return;

    let status1 = this.client.plugins.misc.getAFK(
      message.guild,
      message.author
    );

    let afkStartAuthor = this.client.plugins.misc.getAFKStart(
      message.guild,
      message.author
    );

    if (status1) {
      this.client.plugins.misc.setAFK(message.guild, message.author, false);
      this.client.plugins.misc.setMessage(message.guild, message.author, "");

      const wb = new DefaultEmbed()
          .setColor("#4289c1")
          .setDescription(
            `👋 Welcome back ${message.author}! You were gone for **${ms(Date.now() - afkStartAuthor, { long: true })}**`
          );

      return message.channel.send({
        embeds: [wb],
      });
    }

    let member = message.mentions.members.first();
    if (member) {
      let status = this.client.plugins.misc.getAFK(message.guild, member);
      let msg = this.client.plugins.misc.getAFKMessage(message.guild, member);

      if (status) {
        let afkStartMember = this.client.plugins.misc.getAFKStart(message.guild, member);

        const away = new DefaultEmbed()
          .setColor("#4289c1")
          .setDescription(
            `💤 ${member.user.toString()} is currently **AFK** for \`${msg}\` set **${ms(Date.now() - afkStartMember, {
              long: true,
            })}** ago.`
          );

        message.reply({
          embeds: [away],
        });
      }
    }
  }
};
