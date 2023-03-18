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
    for (const guild of this.client.guilds.cache.values()) {
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

          const random = Math.floor(Math.random() * 5);

          await this.client.plugins.economy.addToBalance(
            guild.id,
            voiceState.member.user,
            random
          );
        }
      }
    }
  }
};
