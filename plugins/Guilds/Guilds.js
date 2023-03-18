const Enmap = require("enmap");
const crypto = require("crypto");

class GuildsPlugin {
  constructor(client) {
    this.version = 1.0;
    this.client = client;
    this.database = new Enmap({ name: "guilds" });
  }

  randomId() {
    return crypto.randomUUID().split("-")[0];
  }
  get(server_id, id) {
    return this.database.get(`${server_id}-${id}`);
  }
  set(server_id, id, data) {
    this.database.set(`${server_id}-${id}`, data);
  }
  delete(server_id, id) {
    this.database.delete(`${server_id}-${id}`);
  }
  has(server_id, id) {
    return this.database.has(`${server_id}-${id}`);
  }
  all(server_id) {
    return this.database.filterArray((_, key) =>
      key.startsWith(`${server_id}-`)
    );
  }
  userGuild(server_id, user_id) {
    return this.all(server_id).find((guild) =>
      guild.members.some((r) => r.id === user_id)
    );
  }
}

module.exports = GuildsPlugin;
