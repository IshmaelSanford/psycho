const { Cron } = require("../../../structures");

module.exports = class extends Cron {
  constructor(client) {
    super(client, {
      enabled: true,
      format: "* * * * *",
    });
  }
  async execute() {
    const bans = await this.client.plugins.moderation.getAllTempbans();

    for (const [_key, data] of bans) {
      if (data.unbanned) continue;
      if (Date.now() < data.endsAt) continue;

      let guild_id = _key.split("-")[0];
      let user_id = _key.split("-")[1];

      const guild = this.client.guilds.cache.get(guild_id);
      if (!guild) continue;

      guild.bans.remove(user_id).catch(() => {});

      this.client.plugins.moderation.setUnbannedStatus(_key, true);
    }
  }
};
