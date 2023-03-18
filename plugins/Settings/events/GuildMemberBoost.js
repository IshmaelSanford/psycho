const { DefaultEmbed } = require("../../../embeds");
const { Event } = require("../../../structures");

const { EmbedBuilder } = require("@discordjs/builders");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      name: "guildMemberBoost",
    });
  }
  async run(member) {
    const boostChannel = await this.client.plugins.settings.getBoostChannel(
      member.guild
    );
    let messageData = structuredClone(
      await this.client.plugins.settings.getBoostMessage(member.guild)
    );

    if (!messageData)
      messageData = {
        title: "New Boost",
        description: `{user} just boosted server and unlocked booster role!`,
        color: 0xff73fa,
      };

    messageData.description = messageData.description
      .replace(/{user.tag}/g, member.user.tag)
      .replace(/{user.id}/g, member.user.id)
      .replace(/{user}/g, member.user.toString())
      .replace(/{guild}/g, member.guild.name)
      .replace(/{guild.id}/g, member.guild.id)
      .replace(/{guild.memberCount}/g, member.guild.memberCount);

    messageData.description += `\n\n🚀 **Booster role unlocked** \`\`\`br-hex <hex>\nbr-icon <icon_url> \nbr-name <name> \nbr-reset \n\`\`\``;

    member.guild.channels.cache
      .get(boostChannel)
      ?.send({ content: `${member}` })
      .then((x) => setTimeout(() => x.delete(), 1500));

    member.guild.channels.cache.get(boostChannel)?.send({
      embeds: [new EmbedBuilder(messageData)],
    });
  }
};
