const { ChannelType } = require("discord.js");
const { Cron } = require("../../../structures");

module.exports = class extends Cron {
  constructor(client) {
    super(client, {
      enabled: true,
      format: "* * * * *",
    });
  }
  async execute() {
    let guild = this.client.guilds.cache.get(this.client.config.server_id);

    let voiceChannels = guild.channels.cache.filter(
      (x) => x.type === ChannelType.GuildVoice
    );

    for (let [_, channel] of voiceChannels) {
      for (let [__, member] of channel.members) {
        let voiceState = member.voice;
        if (
          voiceState.selfDeaf ||
          voiceState.selfMute ||
          voiceState.serverDeaf ||
          voiceState.serverMute
        )
          continue;
        if (voiceState.member.user.bot) continue;

        const sortedBoosters = this.client.plugins.leveling
          .getBoosters()
          .sort((a, b) => b.boost_rate - a.boost_rate);

        let booster = 1;

        for (const { role_id, boost_rate } of sortedBoosters) {
          if (voiceState.member.roles.cache.has(role_id)) {
            booster = boost_rate;
            break;
          }
        }

        await this.client.plugins.leveling.addXP(
          voiceState.member,
          this.client.config.leveling.voice_activity_gain_per_hour * booster
        );
        console.log(
          chalk.green(`${member.author.username} earned XP from using voice`)
        );
      }
    }
  }
};
