const { Cron } = require("../../../structures");

module.exports = class extends Cron {
  constructor(client) {
    super(client, {
      enabled: true,
      format: "* * * * *",
    });
  }
  async execute() {
    const jails = await this.client.plugins.moderation.getAllTempJails();

    for (const [_key, data] of jails) {
      if (data.unjailed) continue;
      if (Date.now() < data.endsAt) continue;

      let guild_id = _key.split("-")[0];
      let user_id = _key.split("-")[1];

      const guild = this.client.guilds.cache.get(guild_id);
      if (!guild) continue;

      const member = guild.members.cache.get(user_id);
      if (!member) continue;
      member.roles
        .remove(this.client.plugins.moderation.getJailRole(guild))
        .catch(() => {});

      this.client.plugins.moderation.setUnjailedStatus(_key, true);
    }
  }
};
