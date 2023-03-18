const Enmap = require("enmap");

class VotePollingPlugin {
  constructor(client) {
    this.client = client;
    this.database = new Enmap({
      name: "vote-polls",
      autoEnsure: {
        results_channel: null,
        endsAt: null,
        optionsAmount: null,
      },
    });
  }
  async create(
    channel,
    message_id,
    results_channel,
    question,
    endsAt,
    optionsAmount
  ) {
    let data = {
      channel,
      results_channel,
      question: question,
      endsAt: endsAt,
      optionsAmount,
      ended: false,
    };

    this.database.set(message_id, data);
  }
  get(message_id) {
    this.database.get(message_id);
  }

  end(message_id) {
    this.database.set(message_id, true, "ended");
  }

  async getEverything() {
    return await this.database.fetchEverything();
  }
}

module.exports = VotePollingPlugin;
