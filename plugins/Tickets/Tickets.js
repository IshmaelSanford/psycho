const Enmap = require("enmap");

const db = new Enmap({ name: "tickets" });

class TicketsPlugin {
  constructor(client) {
    this.client = client;
    this.database = db;
  }
  getData({ id }) {
    return this.database.get(id);
  }
  addTicket({ id }, channel) {
    this.database.set(id, {
      channel: channel.id,
    });
  }
  deleteTicket({ id }) {
    this.database.delete(id);
  }
}

module.exports = TicketsPlugin;
