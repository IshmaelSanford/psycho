const { Event } = require("../../../structures");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      name: "guildMemberBoost",
    });
  }
  async run(member) {
    this.client.plugins.boost.register(member);
  }
};
