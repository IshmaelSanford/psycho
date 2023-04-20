const { Command } = require("../../../structures");
const {
  DefaultEmbed,
  SuccessEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "afk",
      enabled: true,
      syntax: 'afk [reason]',
      about: 'Set afk status until you send a message again',
      example: 'afk sleeping',
    });
  }
  async execute(message, args) {
    const status = this.client.plugins.misc.getAFK(
      message.guild,
      message.author
    );
    console.log(`Initial status: ${status}`);
  
    if (!status) {
      const msg = args.join(" ") || "AFK";
  
      await this.client.plugins.misc.setMessage(message.guild, message.author, msg);
      this.client.plugins.misc.setAFK(message.guild, message.author, true);
      await message.channel.send({
        embeds: [
          new SuccessEmbed({
            description: `You are now **AFK** for **${msg}**`,
          },message),
        ],
      });
  
      const newStatus = this.client.plugins.misc.getAFK(
        message.guild,
        message.author
      );
      console.log(`New status: ${newStatus}`);
    }
  }
}