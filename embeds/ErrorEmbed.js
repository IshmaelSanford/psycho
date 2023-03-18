const { EmbedBuilder } = require("discord.js");

class ErrorEmbed extends EmbedBuilder {
  constructor(data) {
    super(data);
    this.data.color = 0xf4686a;
    this.data.description = `<:deny:1086430263489351761> ${data.description}`;
  }
}

module.exports = ErrorEmbed;
