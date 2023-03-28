const { EmbedBuilder } = require("discord.js");

class WarnEmbedDm extends EmbedBuilder {
  constructor(data, message) {
    super(data);
    this.data.color = 0xffaf31;
    this.data.description = `<:psywarning:1087534589645426738> ${data.description}`;
  }
}

module.exports = WarnEmbedDm;
