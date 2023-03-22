const Enmap = require("enmap");
const { DefaultEmbed } = require("../../embeds");

const database = new Enmap({
  name: "boosters",
  autoEnsure: {
    allowed: false,
    role_id: null,
  },
});

class BoostPlugin {
  constructor(client) {
    this.client = client;
    this.database = database;
  }
  async register(member) {
    if (this.database.get(`${member.guild.id}-${member.id}`, "booster_role"))
      return;

    let role = await member.guild.roles
      .create({
        name: `${member.displayName}`,
        hoist: false,
        mentionable: false,
        position: member.roles.highest.position + 1,
        reason: "[BoosterRolePlugin] User boosted server.",
      })
      .catch(() => {
        return null;
      });

    if (!role) return;

    let data = {
      allowed: true,
      role_id: role.id,
    };

    database.set(`${member.guild.id}-${member.id}`, data);

    await member.roles.add(role.id);
    await this.sendBoostEmbed(member);
  }

  async sendBoostEmbed(member) {
    let vanityUrl = `${member.guild.name}`;
    try {
      const vanity = await member.guild.fetchVanityData();
      if (vanity.code) {
        vanityUrl = `discord.gg/${vanity.code}`;
      }
    } catch (error) {
      console.error(`Vanity URL not found for guild ${member.guild.id}`);
    }

    const embed = new DefaultEmbed()
      .setColor("#FF69B4")
      .setAuthor({ name: vanityUrl, iconURL: 'https://cdn3.emoji.gg/emojis/6494-discord-boost.gif' })
      .setTitle(`Thanks for boosting ${member.guild.name}`)
      .setDescription(`You can now make a booster role! Use these commands to get started:`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png' }))
      .addFields({ name: '\u200B', value: '```\nSteps:\n,br [hex] [name]\n,br icon [emoji]\n,br rename [name]\n```' })
      .setFooter({ text: `rep ${member.guild.name} by putting ${vanityUrl} in your status!` });

    const boostChannelID = this.client.settings.getBoostChannel(member.guild) || member.guild.systemChannelID;
    const boostChannel = member.guild.channels.cache.get(boostChannelID);

    if (boostChannel) {
      boostChannel.send({ content: `<@${member.id}>`, embeds: [embed] });
    } else {
      console.error(`Boost channel not found for guild ${member.guild.id}`);
    }
  }

  remove(member) {
    let role = member.guild.roles.cache.get(getRole(member));

    role?.delete("[BoosterRolePlugin] User stopped boosting server.");

    let data = {
      allowed: false,
      role_id: null,
    };

    database.set(`${member.guild.id}-${member.id}`, data);
  }
  getRole(member) {
    return this.database.get(`${member.guild.id}-${member.id}`, "role_id");
  }
}

module.exports = BoostPlugin;
