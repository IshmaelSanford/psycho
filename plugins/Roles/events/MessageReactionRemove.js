const { Event } = require("../../../structures/");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageReactionRemove",
      enabled: true,
    });
  }
  async run(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const status = this.client.plugins.roles.reactionroles.get(
      reaction.message.guild.id,
      "locked"
    );

    if (status) return;

    const reaction_roles = this.client.plugins.roles.getReactionRoleList(
      reaction.message.guild.id
    );

    for (const rr of reaction_roles) {
      if (
        (rr.emoji.includes(reaction.emoji.id) || rr.emoji === reaction.emoji.name) &&
        rr.message_id === reaction.message.id &&
        rr.remove_on_unreact
      ) {
        const member = reaction.message.guild.members.cache.get(user.id);
        member.roles.remove(rr.role_id).catch(() => {});
      }
    }
  }
};
