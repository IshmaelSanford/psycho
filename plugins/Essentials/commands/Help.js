const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  DefaultEmbed,
  WrongSyntaxEmbed,
  ErrorEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      enabled: true,
      syntax: "help <command>",
      example: "help rank",
      about: 'Get help with a command',
    });
  }
  async execute(message, args) {
    let commandName = args[0];

    if (!commandName)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax, this.example)],
      });

    let command =
      this.client.commands.prefix.get(commandName) ||
      this.client.aliases.get(commandName);

    if (!command)
      return message.reply({
        embeds: [new ErrorEmbed({ description: `Cannot find that command.` })],
      });

    const prefix = await this.client.plugins.settings.prefix(message.guild);

    const embed = new DefaultEmbed()
      .setAuthor({
        name: "psycho helper",
        iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(`Command: ${command.name}`)
      .setDescription(`${command.about}`)
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: "Server Prefix", value: `\`${prefix}\``},
        { name: "Aliases", value: command.aliases.map(alias => `\`${alias}\``).join(' '), inline: true },
        { name: "Staff-Only", value: command.staffOnly ? "`true`" : "`false`", inline: true },
        { name: "Syntax", value: `\`${prefix}${command.syntax}\`` },
        { name: "Example", value: `\`${prefix}${command.example}\`` }
      )
      .setFooter({ text: `<mandatory args> [optional args]` });
    await message.reply({ embeds: [embed] });
  }
};
