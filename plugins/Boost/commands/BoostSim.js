const { SlashCommandBuilder } = require("@discordjs/builders");
const { Command } = require("../../../structures/");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "boostsim",
      enabled: true,
      about: "Simulate a boost for testing purposes",
    });
  }

  async execute(message, args) {
    const boostChannelID = this.client.settings.getBoostChannel(message.guild) || message.guild.systemChannelID;
    const boostChannel = member.guild.channels.cache.get(boostChannelID);

    const embed = new DefaultEmbed()
      .setColor("#FF69B4")
      .setAuthor({ name: message.guild.name, iconURL: 'https://cdn3.emoji.gg/emojis/6494-discord-boost.gif' })
      .setTitle(`Thanks for boosting ${message.guild.name}`)
      .setDescription(`You can now make a booster role! Use these commands to get started:`)
      .addFields({ name: '\u200B', value: '```\nSteps:\n,br [hex] [name]\n,br icon [emoji]\n,br rename [name]\n```' })
      .setFooter({ text: `rep ${message.guild.name} by putting ${message.guild.vanityURLCode ? `discord.gg/${message.guild.vanityURLCode}` : message.guild.name} in your status!` });

    boostChannel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
    message.reply({
      embeds: [
        new DefaultEmbed({
          description: `Sent boost embed in ${boostChannel}`,
        }, message),
      ],
    });
  }
};
