const { Event } = require("../../../structures");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      name: "guildMemberUnboost",
    });
  }
  async run(member) {
    this.client.plugins.boost.remove(member);
  }
};
