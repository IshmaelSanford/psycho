const { EmbedBuilder } = require("discord.js");

class UnlockEmbed extends EmbedBuilder {
  constructor(data, message) {
    super(data);
    this.data.color = 0xffac33;
    this.data.description = `🔓 ${message.author.toString()}: ${data.description}`;
  }
}

module.exports = UnlockEmbed;
