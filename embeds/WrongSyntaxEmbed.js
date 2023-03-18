const { EmbedBuilder } = require("discord.js");

class WrongSyntaxEmbed extends EmbedBuilder {
  constructor(client, message, command) {
    super();

    const prefix = client.plugins.settings.prefix(message.guild);

    this.setAuthor({
      name: "psycho helper",
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
      .setTitle(`Command: ${command.name}`)
      .setDescription(`${command.about}`)
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: "Server Prefix", value: `\`${prefix}\`` },
        {
          name: "Aliases",
          value: command.aliases.map((alias) => `\`${alias}\``).join(" "),
          inline: true,
        },
        {
          name: "Staff-Only",
          value: command.staffOnly ? "`true`" : "`false`",
          inline: true,
        },
        { name: "Syntax", value: `\`${prefix}${command.syntax}\`` },
        { name: "Example", value: `\`${prefix}${command.example}\`` }
      )
      .setFooter({ text: "<mandatory args> [optional args]" })
  }
}

module.exports = WrongSyntaxEmbed;
