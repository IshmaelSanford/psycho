const Enmap = require("enmap");

const tempbans = new Enmap({
  name: "tempbans",
  autoEnsure: {
    guild: null,
    moderator: null,
    endsAt: null,
    reason: null,
    unbanned: true,
  },
});

const infractions = new Enmap({
  name: "infractions",
  autoEnsure: {
    infractions: [],
  },
});

const jails = new Enmap({
  name: "jails",
  autoEnsure: {
    guild: null,
    moderator: null,
    endsAt: null,
    reason: null,
    unjailed: true,
  },
});

const staff = new Enmap({
  name: "staff",
  autoEnsure: {
    allowed: false,
  },
});

class ModerationPlugin {
  constructor(client) {
    this.client = client;
    this.staff = staff;
    this.tempbans = tempbans;
    this.infractions = infractions;
    this.jails = jails;
  }
  get logChannel() {
    return this.client.channels.cache.get(
      this.client.config.moderation.punish_logs
    );
  }

  checkAllowance(guild, member) {
    return this.staff.get(`${guild.id}-${member.id}`, "allowed");
  }
  addStaff(guild, member) {
    this.staff.set(`${guild.id}-${member.id}`, true, "allowed");
  }
  removeStaff(guild, member) {
    this.staff.set(`${guild.id}-${member.id}`, false, "allowed");
  }
  async getStaffList(guild) {
    let list = [];
    const everything = await this.staff.fetchEverything();
    for (const [key, data] of everything) {
      if (!key.startsWith(`${guild.id}-`)) continue;
      if (!data.allowed) continue;
      else list.push(key.split("-")[1]);
    }
    return list;
  }

  tempban(guild, member, moderator, duration, reason) {
    //member.ban({ reason, days: 1 });
    this.tempbans.set(`${guild.id}-${member.id}`, {
      guild: guild.id,
      moderator: moderator.id,
      endsAt: Date.now() + duration,
      reason,
      unbanned: false,
    });
  }
  async getAllTempbans() {
    return await this.tempbans.fetchEverything();
  }
  setUnbannedStatus(key, status) {
    this.tempbans.set(key, Boolean(status), "unbanned");
  }

  getInfractions(guild, member) {
    return this.infractions.get(`${guild.id}-${member.id}`, "infractions");
  }
  addInfraction(guild, member, moderator, reason) {
    this.infractions.push(
      `${guild.id}-${member.id}`,
      {
        moderator: moderator.id,
        date: Date.now(),
        reason,
      },
      "infractions"
    );
  }
  clearInfractions(guild, member) {
    this.infractions.set(`${guild.id}-${member.id}`, [], "infractions");
  }

  jail(guild, member, moderator, duration, reason) {
    member.roles
      .add(this.client.plugins.settings.getJailRole(guild))
      .catch(() => {});
    this.jails.set(`${guild.id}-${member.id}`, {
      guild: guild.id,
      moderator: moderator.id,
      endsAt: Date.now() + duration,
      reason,
      unjailed: false,
    });
  }
  setUnjailedstatus(key, status) {
    this.tempbans.set(key, Boolean(status), "unbanned");
  }
}

module.exports = ModerationPlugin;
