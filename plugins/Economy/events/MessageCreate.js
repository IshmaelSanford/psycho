const { ErrorEmbed } = require("../../../embeds");
const { Event } = require("../../../structures/");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageCreate",
      enabled: true,
    });
    this.count = new Map();
  }
  async run(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const dropFrequency = this.client.plugins.economy.getDropChannel(
      message.channel.id
    );
    if (dropFrequency && dropFrequency > 2) {
      const count = this.count.get(message.channel.id) || 1;
      if (count >= dropFrequency) {
        this.count.set(message.channel.id, 1);
        this.client.plugins.economy.createDrop(
          message.channel,
          "A random drop appeared!",
          this.client.config.economy.drop_reward
        );
      } else {
        this.count.set(message.channel.id, count + 1);
      }
    }
  }
};
