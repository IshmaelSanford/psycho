const { EmbedBuilder } = require("discord.js");

class SuccessEmbed extends EmbedBuilder {
  constructor(data, message) {
    super(data);
    this.data.color = 0xacec7c;
    this.data.description = `<:approve:1086430347220221992> ${message.author.toString()}: ${data.description}`;
  }
}

module.exports = SuccessEmbed;
