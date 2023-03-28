const Enmap = require("enmap");
const config = require("../../config");

const messages = new Enmap({
  name: "messages",
  autoEnsure: {
    embed: null,
    posted: false,
  },
});
const settings = new Enmap({
  name: "starboard-settings",
  autoEnsure: {
    emoji: "⭐",
    channel: null,
    color: config.color,
    threshold: 5,
    enabled: true,
  },
});

class StarboardPlugin {
  constructor(client) {
    this.client = client;
    this.settings = settings;
    this.messages = messages;
  }

  getEmoji(guild) {
    return this.settings.get(guild.id, "emoji");
  }
  getChannel(guild) {
    return this.settings.get(guild.id, "channel");
  }
  getColor(guild) {
    return this.settings.get(guild.id, "color");
  }
  getThreshold(guild) {
    return this.settings.get(guild.id, "threshold");
  }
  getStatus(guild) {
    return this.settings.get(guild.id, "enabled");
  }

  setEmoji(guild, emoji) {
    this.settings.set(guild.id, emoji, "emoji");
  }
  setChannel(guild, channel) {
    this.settings.set(guild.id, channel.id, "channel");
  }
  setColor(guild, color) {
    this.settings.set(guild.id, color, "color");
  }
  setThreshold(guild, amount) {
    this.settings.set(guild.id, amount, "threshold");
  }
  toggle(guild) {
    const status = this.getStatus(guild);
    this.settings.set(guild.id, !status, "enabled");
  }
  getMsg(msgID) {
    return this.messages.has(msgID) ? this.messages.get(msgID, "posted") : null;
  }
  saveMsg(msgID, embedID) {
    this.messages.set(msgID, true, "posted");
    this.messages.set(msgID, embedID, "embed");
  }
}

module.exports = StarboardPlugin;
