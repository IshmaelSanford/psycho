const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WarnEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "valorant",
      enabled: true,
      syntax: "valorant <player_name>",
      about: "Display Valorant stats for a player",
    });
  }

  async execute(message, args) {
    if (args.length < 1) {
      return message.channel.send(
        new WrongSyntaxEmbed(this.client, message, this)
      );
    }

    const playerName = args[0];

    try {
      const response = await fetch(`https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${encodeURIComponent(playerName)}`, {
        headers: {
          "TRN-Api-Key": "37e4425a-7781-4578-bc8d-d342e8d9b82b",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching Valorant data");
      }

      const data = await response.json();

      const playerData = data.data;

      const embed = new DefaultEmbed()
        .setTitle(`Valorant stats for ${playerName}`)
        .setDescription(`**Username:** ${playerData.platformInfo.platformUserHandle}`)
        .addFields(
          { name: "**MMR**", value: playerData.segments[0].stats.mmr.value, inline: true },
          { name: "**Rank**", value: playerData.segments[0].stats.rank.metadata.name, inline: true },
          { name: "**K/D Ratio**", value: playerData.segments[0].stats.kDRatio.value, inline: true },
          { name: "**Kills**", value: playerData.segments[0].stats.kills.value, inline: true },
          { name: "**Deaths**", value: playerData.segments[0].stats.deaths.value, inline: true },
          { name: "**Assists**", value: playerData.segments[0].stats.assists.value, inline: true }
        );

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return message.channel.send(new WarnEmbed({ description: "Error fetching Valorant stats" }, message));
    }
  }
};
