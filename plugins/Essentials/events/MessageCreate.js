const { ErrorEmbed } = require("../../../embeds");
const { Event } = require("../../../structures/");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageCreate",
      enabled: true,
    });
  }
  async run(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const disabledChannels = this.client.plugins.settings.getDisabledCommands(
      message.guild
    );
    if (disabledChannels.includes(message.channel.id)) return;

    let prefix = this.client.plugins.settings.prefix(message.guild);

    if (!message.content.startsWith(prefix)) return;
    if (message.content.length <= prefix.length) return;

    let [commandName, ...args] = message.content
      .slice(prefix.length)
      .split(/ +/g);

    const command =
      this.client.commands.prefix.get(commandName) ||
      this.client.aliases.get(commandName);

    if (!command) return;

    let allowed = this.client.plugins.moderation.checkAllowance(
      message.guild,
      message.member
    );

    if (
      command.staffOnly &&
      !allowed &&
      message.author.id !== message.guild.ownerId
    )
      return message.reply({
        embeds: [new ErrorEmbed({ description: "Insufficient permission." })],
      });

    try {
      await command.execute(message, args);
    } catch (error) {
      console.log(
        `\n! ERROR ! \nCommand ${command.name} ocurred following error: \n$${error.message}\n${error.stack}`
      );
    }
  }
};
