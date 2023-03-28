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
      syntax: "help [command]",
      example: "help rank",
      about: 'Get help with a command',
    });
  }

  async execute(message, args) {
    const prefix = await this.client.plugins.settings.prefix(message.guild);

    if (!args.length) {
      const plugins = {};

      // Organize commands by plugin
      this.client.commands.prefix.forEach((command) => {
        const plugin = command.plugin || 'Misc';
        if (!plugins[plugin]) {
          plugins[plugin] = [];
        }
        plugins[plugin].push(command);
      });

      // Sort commands alphabetically within each plugin
      Object.values(plugins).forEach((commands) => {
        commands.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Sort plugins alphabetically
      const pluginNames = Object.keys(plugins).sort();

      const maxPages = pluginNames.length;

      // Generate an embed for the current page
      const generateEmbed = (currentPage) => {
        const currentPlugin = pluginNames[currentPage];
        const commands = plugins[currentPlugin];
      
        const fieldLimit = 10;

        const splitCommands = (commands) => {
          const chunks = [];
          for (let i = 0; i < commands.length; i += fieldLimit) {
            chunks.push(commands.slice(i, i + fieldLimit));
          }
          return chunks;
        };

        const commandChunks = splitCommands(commands);

        const embed = new DefaultEmbed()
          .setAuthor({
            name: "psycho helper",
            iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(`Plugin: ${currentPlugin}`)
          .setDescription(`Use \`${prefix}help [command]\` for more information`);

        commandChunks.forEach((chunk) => {
          const fieldValue = chunk
            .map((command) => `[**${command.name}**](https://discord.gg/xKwdJgn5gn)`)
            .join(", ");

          embed.addFields({
            name: `${currentPlugin}`,
            value: fieldValue,
            inline: false,
          });
        });

        embed.setFooter({ text: `Page ${currentPage + 1}/${maxPages}` });

        return embed;
      };

      const sentMessage = await message.reply({ embeds: [generateEmbed(0)] });

      // Add reactions for pagination
      if (maxPages > 1) {
        await sentMessage.react('⏪');
        await sentMessage.react('⏩');
      }

      const filter = (reaction, user) => {
        return ['⏪', '⏩'].includes(reaction.emoji.name) && user.id === message.author.id;
      };

      const reactionCollector = sentMessage.createReactionCollector({ filter, time: 60000 });

      let currentPage = 0;
      reactionCollector.on('collect', async (reaction, user) => {
        if (reaction.emoji.name === '⏩' && currentPage < maxPages - 1) {
          currentPage++;
        } else if (reaction.emoji.name === '⏪' && currentPage > 0) {
          currentPage--;
        }

        await sentMessage.edit({ embeds: [generateEmbed(currentPage)] });
        await reaction.users.remove(user);
      });

      reactionCollector.on('end', () => {
        sentMessage.reactions.removeAll();
      });

    } else {
      let commandName = args[0];

      let command =
        this.client.commands.prefix.get(commandName) ||
        this.client.aliases.get(commandName);

      if (!command)
        return message.reply({
          embeds: [new ErrorEmbed({ description: `Cannot find that command.` }, message)],
        });

      const embed = new DefaultEmbed()
        .setAuthor({
          name: "psycho helper",
          iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Command: ${command.name}`)
        .setDescription(`${command.about}`)
        .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: "Server Prefix", value: `\`${prefix}\`` },
          { name: "Aliases", value: command.aliases.map(alias => `\`${alias}\``).join(' '), inline: true },
          { name: "Staff-Only", value: command.staffOnly ? "`true`" : "`false`", inline: true },
          { name: "Syntax", value: `\`${prefix}${command.syntax}\`` },
          { name: "Example", value: `\`${prefix}${command.example}\`` }
        )
        .setFooter({ text: `<mandatory args> [optional args]` });
      await message.reply({ embeds: [embed] });
    }
  }
};
