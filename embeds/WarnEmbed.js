const { EmbedBuilder } = require("discord.js");

class WarnEmbed extends EmbedBuilder {
  constructor(data, message) {
    super(data);
    this.data.color = 0xffaf31;
    this.data.description = `<:psywarning:1087534589645426738> ${message.author.toString()}: ${data.description}`;
  }
}

module.exports = WarnEmbed;
