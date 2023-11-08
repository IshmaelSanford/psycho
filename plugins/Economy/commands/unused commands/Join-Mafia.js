const { Command } = require("../../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { SuccessEmbed, ErrorEmbed } = require("../../../../embeds");
const { PermissionFlagsBits, ChannelTypes } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "join-mafia",
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

    if (stats.cash < 1_000_000) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description:
              "You don't have enough cash to join the mafia. You need $1,000,000 cash.",
          }),
        ],
      });
    }

    if (stats.mafia) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: "You are already in the mafia.",
          }),
        ],
      });
    }

    this.client.plugins.economy.removeFromBalance(
      message.guild.id,
      message.author.id,
      1_000_000
    );

    this.client.plugins.economy.setUserMafia(
      message.guild.id,
      message.author.id,
      true
    );

    message.member.roles.add(role);

    message.channel.send({
      embeds: [
        new SuccessEmbed({
          description: `You have joined the mafia. You can now see mafia channels.`,
        }),
      ],
    });
  }
};
