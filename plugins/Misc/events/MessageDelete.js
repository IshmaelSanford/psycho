const { Event } = require("../../../structures/");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageDelete",
      enabled: true,
    });
  }
  async run(message) {
    if (!message.author) return;
    if (message.author.bot) return;
    if (!message.guild) return;

    if (!this.client.snipes) {
      this.client.snipes = new Map();
    }

    const channelId = message.channel.id;

    if (!this.client.snipes.get(channelId)) {
      this.client.snipes.set(channelId, []);
    }

    this.client.snipes.get(channelId).push(message);
  }
};
