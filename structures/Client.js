const { Client, IntentsBitField, Partials, Collection } = require("discord.js");
require("dotenv").config();
const { PluginManager } = require("./");

const logs = require("discord-logs");

module.exports = class extends Client {
  constructor() {
    super({
      intents: new IntentsBitField(3276799),
      partials: [
        Partials.User,
        Partials.GuildMember,
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
      ],
    });

    logs(this);

    this.commands = {
      slash: new Collection(),
      prefix: new Collection(),
    };

    this.aliases = new Collection();

    this.config = require("../config.js");

    this.plugins = new PluginManager(this);

    this.snipes = new Map();
  }

  async start() {
    await this.plugins.load();

    await super.login(process.env.TOKEN);
  }
};
