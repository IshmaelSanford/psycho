const Enmap = require("enmap");

const db = new Enmap({
  name: "leveling",
  autoEnsure: {
    stats: {
      xp: 0,
      level: 1,
      messages: 0,
    },
    cooldowns: {
      nextMessage: 0,
    },
  },
});

const settings = new Enmap({
  name: "lvl-settings",
  autoEnsure: {
    boosters: [],
    xp_rate: 1.0,
    ignoredChannels: [],
    ignoredRoles: [],
    level_up_messages: false,
    level_up_channel: null,
    level_up_message: "🎉 Level up {user}! You are now **{level} level**.",
    roles: [],
    stack_enabled: false,
  },
});

class LevelingPlugin {
  constructor(client) {
    this.client = client;
    this.database = db;
    this.settings = settings;
  }

  getData(guild, user) {
    return this.database.get(`${guild.id}-${user.id}`);
  }
  getMessages(guild, user) {
    return this.database.get(`${guild.id}-${user.id}`, "stats.messages");
  }
  async getAll() {
    return await this.database.fetchEverything();
  }
  getXPRate(guild) {
    return this.settings.get(guild.id, "xp_rate");
  }
  setXPRate(guild, rate) {
    return this.settings.set(guild.id, rate, "xp_rate");
  }
  async addXP(member, amount = null) {
    let earn;
    if (!amount) {
      earn = Math.floor(
        Math.random() * 3 * this.getXPRate(member.guild.id) * booster_rate
      );
    } else {
      earn = Math.floor(amount);
    }

    this.database.math(`${guild.id}-${member.id}`, "+", earn, "stats.xp");
    return earn;
  }
  async removeXP(guild, user, amount = 1) {
    this.database.math(`${guild.id}-${user.id}`, "-", amount, "stats.xp");
  }
  async addMessage(guild, user) {
    this.database.math(`${guild.id}-${user.id}`, "+", 1, "stats.messages");
  }
  async addLevelRole(guild, role, amount) {
    this.settings.push(
      guild.id,
      {
        amount,
        role: role.id,
      },
      "roles"
    );
  }
  async removeLevelRole(guild, role) {
    this.settings.remove(guild.id, (x) => x.role === role.id, "roles");
  }
  getLevelRoles(guild) {
    return this.settings.get(guild.id, "roles");
  }
  getStackStatus(guild) {
    return this.settings.get(guild.id, "stack_enabled");
  }
  toggleStack(guild) {
    const status = this.getStackStatus(guild);
    this.settings.set(guild.id, !status, "stack_enabled");
  }
  async addCooldown(guild, user) {
    this.database.set(
      `${guild.id}-${user.id}`,
      Date.now() + 60000,
      "cooldowns.nextMessage"
    );
  }
  async checkLevelUp(guild, user) {
    const { stats } = this.getData(guild, user);
    return stats.xp >= (stats.level + 1) * 100;
  }
  async getLeaderboard(guild, top = 10) {
    const leveling = this.database;
    const indexes = leveling.indexes.filter((x) =>
      x.startsWith(`${guild.id}-`)
    );

    let data = [];
    for (const index of indexes) {
      const { level } = leveling.get(index, "stats");
      data.push({ id: index.slice(guild.id.length + 1), level });
    }

    data = data.sort((a, b) => b.level - a.level);
    data.length = top;

    return data;
  }
  getLeaderboardRank(guild, user) {
    const leveling = this.database;
    const indexes = leveling.indexes.filter((x) =>
      x.startsWith(`${guild.id}-`)
    );
    let data = [];
    for (const index of indexes) {
      const { level } = leveling.get(index, "stats");
      data.push({ id: index.slice(guild.id.length + 1), level });
    }
    const sorted = data.sort((a, b) => b.level - a.level);
    const result = sorted.indexOf(sorted.find((u) => u.id === user.id)) + 1;
    if (result) return result;
    else return -2;
  }

  getIgnoredChannels(guild) {
    return this.settings.get(guild.id, "ignoredChannels");
  }
  getIgnoredRoles(guild) {
    return this.settings.get(guild.id, "ignoredRoles");
  }
  ignoreChannel(channel) {
    this.settings.push(channel.guild.id, channel.id, "ignoredChannels");
  }
  ignoreRole(role) {
    this.settings.push(role.guild.id, role.id, "ignoredRoles");
  }
  getLevelUpMessagesStatus(guild) {
    return this.settings.get(guild.id, "level_up_messages");
  }
  toggleLevelUpMessages(guild) {
    let status = this.getLevelUpMessagesStatus(guild);
    this.settings.set(guild.id, !status, "level_up_messages");
  }
  setLevelUpChannel(channel) {
    this.settings.set(channel.guild.id, channel.id, "level_up_channel");
  }
  getLevelUpChannel(guild) {
    return this.settings.get(guild.id, "level_up_channel");
  }
  setLevelUpMessage(message, text) {
    this.settings.set(message.guild.id, text, "level_up_message");
  }
}

module.exports = LevelingPlugin;
