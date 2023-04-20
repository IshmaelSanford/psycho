const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "commands",
      enabled: false,
    });
  }
  async execute(message) {
    const prefixCategories = new Map();
    const slashCategories = new Map();
    for (const command of this.client.commands.prefix.values()) {
      if (!prefixCategories.has(command.plugin)) {
        prefixCategories.set(command.plugin, []);
      }
      prefixCategories.get(command.plugin).push(command);
    }
    for (const command of this.client.commands.slash.values()) {
      if (!slashCategories.has(command.plugin)) {
        slashCategories.set(command.plugin, []);
      }
      slashCategories.get(command.plugin).push(command);
    }

    const embed = new DefaultEmbed()
      .setTitle("Prefix Commands")
      .setThumbnail(this.client.user.displayAvatarURL());

    for (const [category, commands] of prefixCategories) {
      embed.addFields({
        name: `Prefix - ${category}`,
        value: commands.map((command) => `\`${command.name}\``).join(" "),
        inline: true,
      });
    }

    for (const [category, commands] of slashCategories) {
      embed.addFields({
        name: `Slash - ${category}`,
        value: commands.map((command) => `\`${command.name}\``).join(" "),
        inline: true,
      });
    }

    await message.reply({ embeds: [embed] });
  }
};
