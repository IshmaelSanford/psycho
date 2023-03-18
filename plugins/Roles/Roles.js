const Enmap = require("enmap");

const autoroles = new Enmap({
  name: "autoroles",
  autoEnsure: {
    roles: [],
  },
});

const reactionroles = new Enmap({
  name: "reactionroles",
  autoEnsure: {
    locked: false,
    data: [],
  },
});

class RolesPlugin {
  constructor(client) {
    this.client = client;
    this.autoroles = autoroles;
    this.reactionroles = reactionroles;
  }

  autoRolesAdd(guild, role) {
    autoroles.push(guild.id, role.id, "roles");
  }
  autoRolesRemove(guild, role) {
    autoroles.remove(guild.id, role.id, "roles");
  }
  autoRolesClear(guild) {
    autoroles.set(guild.id, [], "roles");
  }

  getAutoRolesList(guild) {
    return autoroles.get(guild.id, "roles");
  }

  reactionRoleAdd(guild_id, channel_id, message_id, emoji, role_id) {
    reactionroles.push(
      guild_id,
      { channel_id, message_id, emoji, role_id },
      "data"
    );
  }
  reactionRoleRemove(guild_id, message_id, emoji) {
    try {
      reactionroles.remove(
        guild_id,
        (role) => role.message_id === message_id && role.emoji === emoji,
        "data"
      );
    } catch (error) {}
  }
  reactionRoleRemoveAll(guild_id, message_id) {
    reactionroles.remove(
      guild_id,
      (role) => role.message_id === message_id,
      "data"
    );
  }
  reactionRoleClear(guild_id) {
    reactionroles.set(guild_id, [], "data");
  }
  reactionRoleLock(guild_id) {
    reactionroles.set(guild_id, true, "locked");
  }
  reactionRoleUnlock(guild_id) {
    reactionroles.set(guild_id, false, "locked");
  }
  getReactionRoleList(guild_id) {
    return reactionroles.get(guild_id, "data");
  }
}

module.exports = RolesPlugin;
