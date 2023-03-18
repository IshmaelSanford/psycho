const Enmap = require("enmap");

const database = new Enmap({
  name: "boosters",
  autoEnsure: {
    allowed: false,
    role_id: null,
  },
});

class BoostPlugin {
  constructor(client) {
    this.client = client;
    this.database = database;
  }
  async register(member) {
    if (this.database.get(`${member.guild.id}-${member.id}`, "booster_role"))
      return;

    let role = await member.guild.roles
      .create({
        name: `${member.displayName}'s role`,
        hoist: false,
        mentionable: false,
        position: member.roles.highest.position + 1,
        reason: "[BoosterRolePlugin] User boosted server.",
      })
      .catch(() => {
        return null;
      });

    if (!role) return;

    let data = {
      allowed: true,
      role_id: role.id,
    };

    database.set(`${member.guild.id}-${member.id}`, data);

    await member.roles.add(role.id);
  }
  remove(member) {
    let role = member.guild.roles.cache.get(getRole(member));

    role?.delete("[BoosterRolePlugin] User stopped boosting server.");

    let data = {
      allowed: false,
      role_id: null,
    };

    database.set(`${member.guild.id}-${member.id}`, data);
  }
  getRole(member) {
    return this.database.get(`${member.guild.id}-${member.id}`, "role_id");
  }
}

module.exports = BoostPlugin;
