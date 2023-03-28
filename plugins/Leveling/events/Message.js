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
    if (this.shouldIgnoreMessage(message)) return;

    this.handleLeveling(message);
  }

  shouldIgnoreMessage(message) {
    if (!message.guild || message.author.bot) return true;

    const levelingEnabled = this.client.plugins.leveling.getLevelingEnabled(message.guild);
    if (!levelingEnabled) return true;

    const ignoredChannels = this.client.plugins.leveling.getIgnoredChannels(message.guild);
    if (ignoredChannels.includes(message.channel.id)) return true;

    const ignoredRoles = this.client.plugins.leveling.getIgnoredRoles(message.guild);
    if (message.member.roles.cache.some(role => ignoredRoles.includes(role.id))) return true;

    return false;
  }

  async handleLeveling(message) {
    const { cooldowns } = this.client.plugins.leveling.getData(message.guild, message.member);
    this.client.plugins.leveling.addMessage(message.guild, message.member);

    if (Date.now() < cooldowns.nextMessage) return;

    this.client.plugins.leveling.addXP(message.member);
    this.client.plugins.leveling.addCooldown(message.guild, message.member);

    const levelingData = this.client.plugins.leveling.getData(message.guild, message.member);
    const currentLevel = levelingData.stats.level;

    if (await this.client.plugins.leveling.checkLevelUp(message.guild, message.member)) {
      this.processLevelUp(message, currentLevel);
    }
  }

  async processLevelUp(message, currentLevel) {
    this.client.plugins.leveling.addLevel(message.guild, message.member);

    const roles = this.client.plugins.leveling.getLevelRoles(message.guild);
    const stackStatus = this.client.plugins.leveling.getStackStatus(message.guild);

    for (let { role, amount } of roles) {
      if (currentLevel + 1 === amount) {
        if (!stackStatus) {
          message.member.roles.remove(roles.map((x) => x.role));
        }
        await message.member.roles.add(role);
      }
    }

    this.sendLevelUpMessage(message, currentLevel + 1);
  }

  sendLevelUpMessage(message, newLevel) {
    let defaultLevelUpMessage = "🎉 Level up {user}! You are now **{level} level**.";
    let customLevelUpMessage = this.client.plugins.leveling.getLevelUpMessage(message.guild);

    let combinedLevelUpMessage = defaultLevelUpMessage.replace(/{user}/g, message.author).replace(/{level}/g, newLevel) + `\n*${customLevelUpMessage}*`;

    const embed = new DefaultEmbed({
      description: combinedLevelUpMessage,
    });

    let levelUpMessages = this.client.plugins.leveling.getLevelUpMessagesStatus(message.guild);
    let levelUpChannel = this.client.plugins.leveling.getLevelUpChannel(message.guild);

    if (levelUpMessages) {
      if (levelUpChannel) {
        message.guild.channels.cache.get(levelUpChannel)?.send({ embeds: [embed] });
      } else {
        message.channel.send({ embeds: [embed] });
      }
    }
  }
};
