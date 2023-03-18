const { ErrorEmbed } = require("../../../embeds");
const { Event } = require("../../../structures/");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "guildMemberAdd",
      enabled: true,
    });
  }
  async run(member) {
    if (member.user.bot) return;
    if (!member.guild) return;

    const nicknames = this.client.plugins.settings.getNicknames(member.guild);
    const words = this.client.plugins.settings.getWords(member.guild);

    if (nicknames.enabled && words.includes(member.displayName))
      return member
        .kick({ reason: "Blacklisted word in username!" })
        .catch(() => {});
  }
};
