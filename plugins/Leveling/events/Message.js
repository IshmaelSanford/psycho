const { DefaultEmbed } = require("../../../embeds");
const { Event } = require("../../../structures");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageCreate",
      enabled: true,
    });
  }
  async run(message) {
    if (!message.guild) return;
    if (message.author.bot) return;

    const ignored_channels = this.client.plugins.leveling.getIgnoredChannels(
      message.guild
    );
    const ignored_roles = this.client.plugins.leveling.getIgnoredRoles(
      message.guild
    );

    if (ignored_channels.includes(message.channelId)) return;
    if (ignored_roles.includes(message.member.roles.cache)) return;

    const { cooldowns } = this.client.plugins.leveling.getData(
      message.guild,
      message.member
    );
    this.client.plugins.leveling.addMessage(message.guild, message.member);

    if (Date.now() < cooldowns.nextMessage) return;

    this.client.plugins.leveling.addCooldown(message.guild, message.member);

    if (
      await this.client.plugins.leveling.checkLevelUp(
        message.guild,
        message.member
      )
    ) {
      this.client.plugins.leveling.addLevel(message.guild, message.member);

      const roles = this.client.plugins.leveling.getLevelRoles(message.guild);

      const stackStatus = this.client.plugins.leveling.getStackStatus(
        message.guild
      );

      for (let { role, amount } of roles) {
        if (level + 1 === amount) {
          if (!stackStatus) {
            message.member.roles.remove(roles.map((x) => x.role));
          }
          await message.member.roles.add(role);
        }
      }

      let levelUpMessage = this.client.plugins
        .getLevelUpMessage(message.guild)
        .replace(/{user}/g, message.author)
        .replace(/{level}/g, level + 1);

      const embed = new DefaultEmbed({
        title: `🎉 Level up!`,
        description: levelUpMessage,
      });

      let levelUpMessages = this.client.plugins.getLevelUpMessagesStatus(
        message.guild
      );
      let levelUpChannel = this.client.plugins.getLevelUpChannel(message.guild);

      if (levelUpMessages && levelUpChannel)
        message.guild.channels.cache
          .get(levelUpChannel)
          ?.send({ embeds: [embed] });
    }
  }
};
