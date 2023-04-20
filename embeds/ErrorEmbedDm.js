const { EmbedBuilder } = require("discord.js");

class ErrorEmbedDm extends EmbedBuilder {
  constructor(data, message) {
    super(data);
    this.data.color = 0xf4686a;
    this.data.description = `<:deny:1086430263489351761> ${data.description}`;
  }
}

module.exports = ErrorEmbedDm;
