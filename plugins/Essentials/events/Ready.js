const { Event } = require("../../../structures/");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "ready",
      enabled: true,
    });
  }
  async run() {
    this.client.guilds.cache.each((guild) => {
      guild.commands.set(
        Array.from(this.client.commands.slash.values()).map((r) =>
          r.data.toJSON()
        )
      );
    });

    this.client.user.setPresence(this.client.config.presence)

    console.log(`[BOT] ${this.client.user.username} is now ready.`);
  }
};