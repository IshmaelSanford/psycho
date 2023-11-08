const { Command } = require("../../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../../embeds");
const { PermissionFlagsBits, ChannelTypes } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "leave-mafia",
      enabled: false,
    });
  }
  async execute(message, args) {
    const mafiaSettings = this.client.plugins.economy.getSettings(
      message.guild.id
    ).mafia;

    const role = message.guild.roles.cache.get(mafiaSettings.role);

    if (!role) {
      return message.channel.send({
        embeds: [new ErrorEmbed({ description: "Mafia not set up." })],
      });
    }

    const { stats } = this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (!stats.mafia) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: "You are not in the mafia.",
          }),
        ],
      });
    }

    this.client.plugins.economy.setUserMafia(
      message.guild.id,
      message.author.id,
      false
    );

    message.member.roles.remove(role);

    message.channel.send({
      embeds: [
        new SuccessEmbed({
          description: `You have left the mafia.`,
        }),
      ],
    });
  }
};
