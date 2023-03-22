const Enmap = require("enmap");
const config = require("../../config");

const prefixes = new Enmap({
  name: "prefix",
  autoEnsure: {
    prefix: config.defaultPrefix,
  },
});

const settings = new Enmap({
  name: "guild-settings",
  autoEnsure: {
    boost: {
      allowed: true,
      booster_role: null,
      },
    safe_search: true,
    jail: {
      role_id: null,
      autojail: {
        enabled: false,
        time: null,
      },
      log_channel: null,
    },
    mod_log: null,
    lock_ignores: [],
    img_only: [],
    boost_channel: null,
    boost_message: null,
    welcome: {
      channel: null,
      message: null,
    },
    goodbye: {
      channel: null,
      message: null,
    },
    filter: {
      words: [],
      nicknames: {
        enabled: false,
      },
      anti_caps: {
        enabled: false,
        channels: [],
      },
      anti_links: {
        enabled: false,
        channels: [],
      },
      mass_mentions: {
        enabled: false,
        channels: [],
      },
      spam: {
        enabled: false,
        channels: [],
      },
    },
    auto_messages: [],
    disabled_commands: [],
    triggers: [],
    tickets: {
      log_channel: null,
      support_role: null,
    },
    reacts: [],
  },
});

class Settings {
  constructor(client) {
    this.client = client;
    this.prefixes = prefixes;
    this.settings = settings;
  }
  setSafeSearch(guild, value) {
    this.settings.set(guild.id, value, "safe_search");
  }
  getSafeSearch(guild) {
    return this.settings.get(guild.id, "safe_search");
  }  
  getData(guild) {
    return this.settings.get(guild.id);
  }
  prefix(guild) {
    return this.prefixes.get(guild.id, "prefix");
  }
  setPrefix(guild, prefix) {
    this.prefixes.set(guild.id, prefix, "prefix");
  }

  addWord(guild, word) {
    this.settings.push(guild.id, word, "filter.words");
  }

  removeWord(guild, word) {
    this.settings.remove(guild.id, word, "filter.words");
  }

  getWords(guild) {
    return this.settings.get(guild.id, "filter.words");
  }

  setAntiCaps(guild, enabled, channel) {
    this.settings.set(guild.id, enabled, "filter.anti_caps.enabled");
    this.settings.push(guild.id, channel, "filter.anti_caps.channels");
  }

  getAntiCaps(guild) {
    return this.settings.get(guild.id, "filter.anti_caps");
  }

  setNicknames(guild, enabled) {
    this.settings.set(guild.id, enabled, "filter.nicknames.enabled");
  }

  setAntiLinks(guild, enabled, channel) {
    this.settings.set(guild.id, enabled, "filter.anti_links.enabled");
    this.settings.push(guild.id, channel, "filter.anti_links.channel");
  }

  getAntiLinks(guild) {
    return this.settings.get(guild.id, "filter.anti_links");
  }

  setMassMentions(guild, enabled, channel) {
    this.settings.set(guild.id, enabled, "filter.mass_mentions.enabled");
    this.settings.push(guild.id, channel, "filter.mass_mentions.channels");
  }

  getMassMentions(guild) {
    return this.settings.get(guild.id, "filter.mass_mentions");
  }

  getNicknames(guild) {
    return this.settings.get(guild.id, "filter.nicknames");
  }

  setSpam(guild, enabled, channels) {
    this.settings.set(guild.id, enabled, "filter.spam.enabled");
    this.settings.set(guild.id, channels, "filter.spam.channels");
  }

  getSpam(guild) {
    return this.settings.get(guild.id, "filter.spam");
  }

  addTrigger(guild, trigger, response) {
    this.settings.push(guild.id, { trigger, response }, "triggers");
  }

  removeTrigger(guild, trigger) {
    this.settings.remove(guild.id, (v) => v.trigger === trigger, "triggers");
  }

  getTriggers(guild) {
    return this.settings.get(guild.id, "triggers");
  }

  clearTriggers(guild) {
    this.settings.set(guild.id, [], "triggers");
  }

  addAutoMessage(guild, channel, time, message) {
    this.settings.push(
      guild.id,
      {
        channel: channel.id,
        time,
        message,
      },
      "auto_messages"
    );
  }

  removeAutoMessage(guild, channel) {
    this.settings.remove(
      guild.id,
      (v) => v.channel === channel.id,
      "auto_messages"
    );
  }

  getAutoMessages(guild) {
    return this.settings.get(guild.id, "auto_messages");
  }

  clearAutoMessages(guild) {
    this.settings.set(guild.id, [], "auto_messages");
  }

  addDisabledCommand(guild, channel) {
    this.settings.push(guild.id, channel.id, "disabled_commands");
  }

  removeDisabledCommand(guild, channel) {
    this.settings.remove(guild.id, channel.id, "disabled_commands");
  }

  getDisabledCommands(guild) {
    return this.settings.get(guild.id, "disabled_commands");
  }

  setJailRole(guild, role) {
    this.settings.set(guild.id, role.id, "jail.role_id");
  }

  getJailRole(guild) {
    return this.settings.get(guild.id, "jail.role_id");
  }

  setJailLog(guild, channel) {
    this.settings.set(guild.id, channel.id, "jail.log_channel");
  }

  getJailLog(guild) {
    return this.settings.get(guild.id, "jail.log_channel");
  }

  setAutoJail(guild, enabled, time) {
    this.settings.set(guild.id, enabled, "jail.autojail.enabled");
    this.settings.set(guild.id, time, "jail.autojail.time");
  }

  getAutoJail(guild) {
    return this.settings.get(guild.id, "jail.autojail");
  }

  setJoinLog(guild, channel) {
    this.settings.set(guild.id, channel.id, "join_log");
  }

  getJoinLog(guild) {
    return this.settings.get(guild.id, "join_log");
  }

  setLogsChannel(guild, channel) {
    this.settings.set(guild.id, channel.id, "logs_channel");
  }

  getLogsChannel(guild) {
    return this.settings.get(guild.id, "logs_channel");
  }

  addLockIgnore(guild, channel) {
    this.settings.push(guild.id, channel.id, "lock_ignores");
  }

  removeLockIgnore(guild, channel) {
    this.settings.remove(guild.id, channel.id, "lock_ignores");
  }

  getLockIgnoreList(guild) {
    return this.settings.get(guild.id, "lock_ignores");
  }

  imageOnlyAdd(guild, channel) {
    this.settings.push(guild.id, channel.id, "img_only");
  }

  imageOnlyRemove(guild, channel) {
    this.settings.remove(guild.id, channel.id, "img_only");
  }

  getImgOnlyList(guild) {
    return this.settings.get(guild.id, "img_only");
  }

  setBoostChannel(guild, channel) {
    this.settings.set(guild.id, channel.id, "boost_channel");
  }
  setBoostMessage(guild, data) {
    this.settings.set(guild.id, data, "boost_message");
  }

  getBoostChannel(guild) {
    return this.settings.get(guild.id, "boost_channel");
  }
  getBoostMessage(guild) {
    return this.settings.get(guild.id, "boost_message");
  }

  setWelcome(guild, channel, message) {
    this.settings.set(guild.id, channel.id, "welcome.channel");
    this.settings.set(guild.id, message, "welcome.message");
  }

  getWelcome(guild) {
    return this.settings.get(guild.id, "welcome");
  }

  setGoodbye(guild, channel, message) {
    this.settings.set(guild.id, channel.id, "goodbye.channel");
    this.settings.set(guild.id, message, "goodbye.message");
  }

  getGoodbye(guild) {
    return this.settings.get(guild.id, "goodbye");
  }

  setModLog(guild, channel) {
    this.settings.set(guild.id, channel.id, "mod_log");
  }

  getModLog(guild) {
    return this.settings.get(guild.id, "mod_log");
  }

  setTicketsLogsChannel(guild, channel) {
    this.settings.set(guild.id, channel.id, "tickets.log_channel");
  }

  setTicketsSupportRole(guild, role) {
    this.settings.set(guild.id, role.id, "tickets.support_role");
  }

  getTicketsLogsChannel(guild) {
    return this.settings.get(guild.id, "tickets.log_channel");
  }

  getTicketsSupportRole(guild) {
    return this.settings.get(guild.id, "tickets.support_role");
  }

  setJailRole(guild, role) {
    this.settings.set(guild.id, role.id, "jail.role_id");
  }
  getJailRole(guild) {
    return this.settings.get(guild.id, "jail.role_id");
  }
  setJailLogChannel(guild, channel) {
    this.settings.set(guild.id, channel.id, "jail.log_channel");
  }
  getJailLogChannel(guild) {
    return this.settings.get(guild.id, "jail.log_channel");
  }

  addReact(guild, channel, message, emoji) {
    this.settings.push(
      guild.id,
      { channel: channel.id, message, emoji },
      "reacts"
    );
  }
  removeReact(guild, channel, message) {
    this.settings.remove(
      guild.id,
      (r) => r.channel === channel.id && r.message === message,
      "reacts"
    );
  }
  getReactList(guild) {
    return this.settings.get(guild.id, "reacts");
  }
}

module.exports = Settings;
