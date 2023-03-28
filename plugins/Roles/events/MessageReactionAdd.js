const { Event } = require("../../../structures/");
const { EmbedBuilder } = require("@discordjs/builders");
const {
  WarnEmbedDm,
} = require("../../../embeds");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageReactionAdd",
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

    if (status) {
      const dmChannel = await user.createDM();
      dmChannel.send({
        embeds: [
          new WarnEmbedDm({
            description: "That ReactionRole is currently locked",
          }),
        ],
      });
      reaction.users.remove(user.id).catch(() => {});
      return;
    }
    
    

    const reaction_roles = this.client.plugins.roles.getReactionRoleList(
      reaction.message.guild.id
    );
    
    console.log('Reaction Roles:', reaction_roles);
    
    for (const rr of reaction_roles) {
      if (
        (rr.emoji.includes(reaction.emoji.id) || rr.emoji === reaction.emoji.name) &&
        rr.message_id === reaction.message.id
      ) {
        const member = reaction.message.guild.members.cache.get(user.id);
        member.roles.add(rr.role_id).catch(() => {});
    
        if (rr.remove_other_roles) {
          // Remove other reaction roles from the user
          const other_roles = reaction_roles.filter(
            (other_rr) =>
              other_rr.message_id === reaction.message.id && other_rr !== rr
          );
    
          for (const other_rr of other_roles) {
            member.roles.remove(other_rr.role_id).catch(() => {});
            const other_reaction = reaction.message.reactions.cache.find(
              (r) =>
                r.emoji.id === other_rr.emoji ||
                r.emoji.name === other_rr.emoji
            );
            if (other_reaction) {
              other_reaction.users.remove(user.id).catch(() => {});
            }
          }
        }
    
        if (rr.remove_on_unreact) {
          reaction.message.createReactionCollector({ filter: (r, u) => r.emoji.id === reaction.emoji.id && u.id === user.id, max: 1 })
            .on('remove', () => {
              member.roles.remove(rr.role_id).catch(() => {});
            });
        }
    
        if (rr.apply_on_rejoin) {
          this.client.plugins.roles.saveUserRole(reaction.message.guild, user, { id: rr.role_id });
        }
      }
    }
  }    
};
