const { Command } = require("../../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../../embeds");
const { PermissionFlagsBits, ChannelTypes } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "set-mafia",
      enabled: false,
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const mafiaSettings = this.client.plugins.economy.getSettings(
      message.guild.id
    ).mafia;

    if (
      message.guild.channels.cache.get(mafiaSettings.channel) &&
      message.guild.channels.cache.get(mafiaSettings.information) &&
      message.guild.roles.cache.get(mafiaSettings.role)
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "Mafia is already set up.",
          }),
        ],
      });
    }

    const role = await message.guild.roles.create({
      name: "Mafia",
      color: "Red",
    });

    const category = await message.guild.channels.create({
      name: "Mafia",
      type: 4,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ["ViewChannel"],
        },
        {
          id: role.id,
          allow: ["ViewChannel"],
        },
      ],
    });

    const channel = await message.guild.channels.create({
      name: "mafia-text",
      type: 0,
      parent: category,
    });

    const information = await message.guild.channels.create({
      name: "mafia-information",
      type: 0,
      parent: category,
    });

    await information.send({
      embeds: [
        new SuccessEmbed({
          description: "This is the information channel for the mafia game.",
        }),
      ],
    });

    this.client.plugins.economy.setMafia(message.guild.id, {
      channel: channel.id,
      information: information.id,
      role: role.id,
    });

    return message.reply({
      embeds: [
        new SuccessEmbed({
          description: "Mafia is set up.",
        }),
      ],
    });
  }
};
