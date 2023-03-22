const { Command } = require("../../../structures");
const {
  DefaultEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  SuccessEmbed,
  WarnEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "br-test",
      enabled: true,
      // Add your user ID here to restrict the command only to you
      ownerOnly: true,
    });
  }
  async execute(message) {
    // Check if the user already has a custom booster role
    let role = this.client.plugins.boost.getRole(message.member);
    role = message.guild.roles.cache.get(role);
    
    if (!role) {
      // If the user doesn't have a custom booster role, register one
      await this.client.plugins.boost.register(message.member);
      return message.channel.send({
        embeds: [
          new SuccessEmbed({
            description: `${message.author.toString()}: Test booster role created`,
          },message),
        ],
      });
    } else {
      return message.channel.send({
        embeds: [
          new WarnEmbed({ description: "You already have a test booster role", },message),
        ],
      });
    }
  }
};
