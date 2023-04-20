const { EmbedBuilder } = require("discord.js");

class SuccessEmbedDm extends EmbedBuilder {
  constructor(data, message) {
    super(data);
    this.data.color = 0xacec7c;
    this.data.description = `<:approve:1086430347220221992> ${data.description}`;
  }
}

module.exports = SuccessEmbedDm;
