const Enmap = require("enmap");
const crypto = require("crypto");
const { DefaultEmbed } = require("../../embeds");

const ensureObject = {
  stats: {
    cash: 0,
    bank: 0,
    gambled: 0,
  },
  cooldowns: {
    nextDaily: 0,
    nextWeekly: 0,
  },
};
const db = new Enmap({
  name: "economy",
  autoEnsure: ensureObject,
});

const dropChannels = new Enmap({
  name: "economy-drop-channels",
});

class EconomyPlugin {
  constructor(client) {
    this.version = 1.0;
    this.client = client;
    this.database = db;
    this.dropChannels = dropChannels;
  }
  getCreditCardBackgroundColor(server_id, user_id) {
    return this.database.get(`${server_id}-${user_id}`, "creditCardBackgroundColor") || null;
  }
  getCreditCardBackgroundImage(server_id, user_id) {
    return this.database.get(`${server_id}-${user_id}`, "creditCardBackgroundImage") || null;
  }
  isUserSupporter(server_id, user_id) {
    const supporterGuildId = this.client.config.supporterGuildId;
    const currentGuildMember = this.client.guilds.cache.get(server_id).members.cache.get(user_id);
    const supporterGuildMember = this.client.guilds.cache.get(supporterGuildId).members.cache.get(user_id);
  
    return (currentGuildMember && currentGuildMember.premiumSince) || (supporterGuildMember && supporterGuildMember.premiumSince);
  }  
  setUserCurrencyIcon(server_id, user_id, icon) {
    const supporterGuildId = this.client.config.supporterGuildId;
    const currentGuildMember = this.client.guilds.cache.get(server_id).members.cache.get(user_id);
    const supporterGuildMember = this.client.guilds.cache.get(supporterGuildId).members.cache.get(user_id);
  
    if (currentGuildMember && currentGuildMember.premiumSince || supporterGuildMember && supporterGuildMember.premiumSince) {
      this.database.set(`${server_id}-${user_id}`, icon, "currencyIcon");
    }
  }
  setCreditCardBackgroundImage(server_id, user_id, imageUrl) {
    const supporterGuildId = this.client.config.supporterGuildId;
    const currentGuildMember = this.client.guilds.cache.get(server_id).members.cache.get(user_id);
    const supporterGuildMember = this.client.guilds.cache.get(supporterGuildId).members.cache.get(user_id);
  
    if (currentGuildMember && currentGuildMember.premiumSince || supporterGuildMember && supporterGuildMember.premiumSince) {
      this.database.set(`${server_id}-${user_id}`, imageUrl, "creditCardBackgroundImage");
    }
  }
  setCreditCardBackgroundColor(server_id, user_id, backgroundColor) {
    this.database.set(`${server_id}-${user_id}`, backgroundColor, "creditCardBackgroundColor");
  }
  setServerCurrencyName(server_id, currencyName) {
    this.database.set(server_id, currencyName, "serverCurrencyName");
  }
  randomId() {
    return crypto.randomUUID().split("-")[0];
  }
  getData(user_id) {
    return this.database.get(`${user_id}`);
  }
  getSettings(server_id) {
    return this.settings.get(server_id);
  }

  async addToBalance(user_id, amount) {
    // Ensure the user's data exists before trying to add to their balance
    this.database.ensure(user_id, {
      stats: {
        cash: 0,
        bank: 0,
        gambled: 0,
      },
    });
    await this.database.math(user_id, "+", amount, "stats.cash");
  }
  
  async setBalance(user_id, amount) {
    const currentStats = this.database.get(user_id, "stats") || { cash: 0, bank: 0, gambled: 0 };
    currentStats.cash = amount;
    await this.database.set(`${user_id}`, { stats: currentStats });
  }
  async removeFromBalance(user_id, amount) {
    await this.database.math(
      `${user_id}`,
      "-",
      amount,
      "stats.cash"
    );
  }
  async addToBank(user_id, amount) {
    // Ensure the default object exists for the user
    this.database.ensure(user_id, ensureObject);
  
    // Perform the addition
    await this.database.math(`${user_id}`, "+", amount, "stats.bank");
  }
  async removeFromBank(user_id, amount) {
    // Ensure the default object exists for the user
    this.database.ensure(user_id, ensureObject);
  
    // Perform the subtraction
    await this.database.math(`${user_id}`, "-", amount, "stats.bank");
  }
  async addToGambled(user_id, amount) {
    await this.database.math(
      `${user_id}`,
      "+",
      amount,
      "stats.gambled"
    );
  }
  async daily(user_id) {
    this.addToBalance(user_id, this.client.config.economy.daily);
    this.database.set(
      `${user_id}`,
      Date.now() + 86400000,
      "cooldowns.nextDaily"
    );
  }
  async weekly(user_id) {
    this.addToBalance(user_id, this.client.config.economy.weekly);
    this.database.set(
      `${user_id}`,
      Date.now() + 86400000 * 7,
      "cooldowns.nextWeekly"
    );
  }
  async depositToBank(user_id, amount) {
    // Retrieve user data
    const userData = this.getData(user_id);
  
    // Check if the user has enough cash in the wallet
    if (userData.stats.cash >= amount) {
      // Subtract the amount from the wallet
      await this.removeFromBalance(user_id, amount);
      // Add the amount to the bank
      await this.addToBank(user_id, amount);
      return true;
    } else {
      return false;
    }
  }
  async withdrawFromBank(user_id, amount) {
    const userData = this.getData(user_id);
    const currentCash = userData.stats.cash;
    const currentBank = userData.stats.bank;

    if (amount <= currentBank) {
      await this.removeFromBank(user_id, amount);
      await this.addToBalance(user_id, amount);
      return true; 
    } else {
      return false; 
    }
  }

  cooldown(user_id, type, time) {
    const data = this.getData(user_id);

    if (!data.cooldowns[type] || data.cooldowns[type] < Date.now()) {
      this.database.set(
        `${user_id}`,
        Date.now() + time,
        `cooldowns.${type}`
      );
      return false;
    } else {
      return true;
    }
  }

  getDropChannel(channel_id) {
    return this.dropChannels.get(channel_id) || -1;
  }

  setDropChannel(channel_id, msgs) {
    this.dropChannels.set(channel_id, msgs);
  }

  deleteDropChannel(channel_id) {
    this.dropChannels.delete(channel_id);
  }

  async createDrop(channel, description, amount) {
    const msg = await channel.send({
      embeds: [
        new DefaultEmbed({
          title: "Random Drop",
          description: description,
        }).setFooter({
          text: `Click the button to claim the drop!`,
        }),
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              label: "Claim",
              custom_id: "claim_drop",
            },
          ],
        },
      ],
    });

    const interaction = await msg.awaitMessageComponent({
      filter: (i) => i.customId === "claim_drop",
      time: 60000 * 5,
    });

    if (!interaction) {
      return interaction.update({
        embeds: [
          new DefaultEmbed({
            title: "Random Drop",
            description: "The drop has expired!",
          }),
        ],
        components: [],
      });
    }

    this.client.plugins.economy.addToBalance(
      interaction.guild.id,
      interaction.user.id,
      amount
    );

    interaction.update({
      embeds: [
        new DefaultEmbed({
          title: "Random Drop",
          description: `${
            interaction.user
          } claimed the drop and received **$${this.client.plugins.economy.parseAmount(
            amount
          )}**!`,
        }),
      ],
      components: [],
    });
  }
  parseAmount(amount, server_id) {
    const currencyName = this.database.get(server_id, "serverCurrencyName") || this.client.config.economy.defaultCurrencyName;
    return `${parseInt(amount, 10).toLocaleString()} ${currencyName}`;
  }
}

module.exports = EconomyPlugin;
