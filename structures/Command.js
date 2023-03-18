class Command {
  constructor(client, config) {
    this.client = client;
    this.name = config.name;
    this.enabled = config.enabled;
    this.syntax = config.syntax || "No syntax provided";
    this.example = config.example || "No examples for this command";
    this.data = config.data;
    this.staffOnly = config.staffOnly || false;
    this.aliases = config.aliases && config.aliases.length > 0 ? config.aliases : ["none"];
    this.about = config.about || "No about found";
  }
}

module.exports = Command;
