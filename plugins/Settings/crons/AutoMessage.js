const { ChannelType } = require("discord.js");
const { Cron } = require("../../../structures");

module.exports = class extends Cron {
  constructor(client) {
    super(client, {
      enabled: true,
      format: "* * * * *",
    });
  }
  async execute() {
    for (const [guildId, settings] of [
      ...this.client.plugins.settings.settings,
    ]) {
      let changed = false;
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) continue;
      const automessages = settings.auto_messages;
      if (!automessages) continue;
      for (const msg of automessages) {
        const channel = this.client.channels.cache.get(msg.channel);
        if (!channel) continue;

        if (!msg.lastSent || Date.now() - msg.lastSent > msg.time) {
          msg.lastSent = Date.now();
          changed = true;
          channel.send(msg.message);
        }
      }
      if (changed) {
        this.client.plugins.settings.settings.set(guildId, settings);
      }
    }
  }
};
