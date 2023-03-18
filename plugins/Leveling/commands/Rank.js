const { SlashCommandBuilder } = require("@discordjs/builders");
const { Command } = require("../../../structures/");
const { Rank } = require("canvacord");
const { AttachmentBuilder } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "rank",
      enabled: true,
      aliases: ["level"],
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const { stats } = await this.client.plugins.leveling.getData(
      message.guild,
      user
    );
    const { xp, level } = stats;

    const RankCard = new Rank()
      .setAvatar(user.displayAvatarURL({ format: "png" }))
      .setCurrentXP(xp, this.client.config.leveling.color)
      .setRequiredXP(level * 100, this.client.config.leveling.color)
      .setRankColor(null, this.client.config.leveling.color)
      .setLevel(level)
      .setRank(getLeaderboardRank(this.client), "RANK", true)
      .setLevelColor(null, this.client.config.leveling.color)
      .setProgressBar(this.client.config.leveling.color)
      .setProgressBarTrack("#E8E8E8")
      .setUsername(user.username)
      .setDiscriminator(user.discriminator);
    if (this.client.config.leveling.background_url)
      RankCard.setBackground(
        "IMAGE",
        this.client.config.leveling.background_url
      );
    const data = await RankCard.build();

    const attachment = new AttachmentBuilder(data, {
      name: "rank.png",
    });

    await message.reply({
      files: [attachment],
    });

    function getLeaderboardRank(client) {
      return client.plugins.leveling.getLeaderboardRank(message.guild, user);
    }
  }
};
