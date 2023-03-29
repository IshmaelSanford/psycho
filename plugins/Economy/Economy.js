const Enmap = require("enmap");
const crypto = require("crypto");
const { DefaultEmbed } = require("../../embeds");

const ensureObject = {
  stats: {
    cash: 0,
    bank: 0,
    gambled: 0,
    mafia: false,
    xp: 0,
  },
  inventory: [],
  cooldowns: {
    nextWork: 0,
    nextChopp: 0,
    nextFish: 0,
    nextDaily: 0,
    nextWeekly: 0,
    nextCrime: 0,
  },
  achievements: {},
};
const db = new Enmap({
  name: "economy",
  autoEnsure: ensureObject,
});

const settings = new Enmap({
  name: "economy-settings",
  autoEnsure: {
    items: [],
    mafia: {
      role: null,
      channel: null,
      information: null,
    },
  },
});

const contracts = new Enmap({
  name: "economy-contracts",
  autoEnsure: [],
});

const blackmarket = new Enmap({
  name: "economy-blackmarket",
  autoEnsure: [],
});

const dropChannels = new Enmap({
  name: "economy-drop-channels",
});

class EconomyPlugin {
  constructor(client) {
    this.version = 1.0;
    this.client = client;
    this.database = db;
    this.settings = settings;
    this.contracts = contracts;
    this.blackmarket = blackmarket;
    this.dropChannels = dropChannels;
  }
  getUserCurrencyName(server_id, user_id) {
    return this.database.get(`${server_id}-${user_id}`, "userCurrencyName") || null;
  }
  getUserCurrencyIcon(server_id, user_id) {
    return this.database.get(`${server_id}-${user_id}`, "userCurrencyIcon") || null;
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
  setUserCurrencyName(server_id, user_id, currencyName) {
    const supporterGuildId = this.client.config.supporterGuildId;
    const currentGuildMember = this.client.guilds.cache.get(server_id).members.cache.get(user_id);
    const supporterGuildMember = this.client.guilds.cache.get(supporterGuildId).members.cache.get(user_id);
  
    if (currentGuildMember && currentGuildMember.premiumSince || supporterGuildMember && supporterGuildMember.premiumSince) {
      this.database.set(`${server_id}-${user_id}`, currencyName, "userCurrencyName");
    }
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
  getTotalServerCash(server_id) {
    let totalServerCash = 0;
  
    this.database.forEach((value, key) => {
      const current_server_id = key.split("-")[0];
  
      if (current_server_id === server_id) {
        totalServerCash += value.cash;
      }
    });
  
    return totalServerCash;
  }
  getTotalGlobalCash(user_id) {
    const serverUserIds = new Set(); // To store unique server-user ids
  
    // Collect all unique server-user ids
    this.database.forEach((value, key) => {
      const [current_server_id, current_user_id] = key.split("-");
      if (current_user_id === user_id) {
        serverUserIds.add(key);
      }
    });
  
    let totalGlobalCash = 0;
  
    // Iterate through each server-user id and sum up the cash
    serverUserIds.forEach((server_user_id) => {
      const userCash = this.database.get(server_user_id, "cash");
      totalGlobalCash += userCash || 0;
    });
  
    return totalGlobalCash;
  }
  setServerCurrencyName(server_id, currencyName) {
    this.database.set(server_id, currencyName, "serverCurrencyName");
  }  
  randomId() {
    return crypto.randomUUID().split("-")[0];
  }
  getData(server_id, user_id) {
    return this.database.get(`${server_id}-${user_id}`);
  }
  getSettings(server_id) {
    return this.settings.get(server_id);
  }
  setMafia(server_id, data) {
    this.settings.set(server_id, data, "mafia");
  }
  setUserMafia(server_id, user_id, bool) {
    this.database.set(`${server_id}-${user_id}`, bool, "stats.mafia");
  }
  async getAll() {
    return await this.database.fetchEverything();
  }
  getStore(guild) {
    return this.settings.get(guild?.id || guild, "enabled");
  }
  setStore(guild, enabled) {
    this.settings.set(guild?.id || guild, enabled, "enabled");
  }
  getItems(guild) {
    return this.settings.get(guild?.id || guild, "items");
  }
  addItem(guild, item) {
    this.settings.push(guild?.id || guild, item, "items");
  }
  editItemName(guild, store_id, name) {
    let data = this.getItems(guild);
    let index = data.findIndex((x) => x.store_id === store_id);
    data[index].item = name;
    this.settings.set(guild?.id || guild, data, "items");
  }
  editItemCost(guild, store_id, cost) {
    let data = this.getItems(guild);
    let index = data.findIndex((x) => x.store_id === store_id);
    data[index].cost = cost;
    this.settings.set(guild?.id || guild, data, "items");
  }
  editItemDescription(guild, store_id, description) {
    let data = this.getItems(guild);
    let index = data.findIndex((x) => x.store_id === store_id);
    data[index].description = description;
    this.settings.set(guild?.id || guild, data, "items");
  }
  removeItem(guild, store_id) {
    let data = this.getItems(guild).filter((x) => x.store_id !== store_id);
    this.settings.set(guild?.id || guild, data, "items");
  }
  getInventory(server_id, user_id) {
    return this.getData(server_id, user_id).inventory;
  }
  hasItemInInventory(server_id, user_id, item, equipped = null) {
    return this.getInventory(server_id, user_id).find(
      (x) =>
        x.id === item && (equipped === null ? true : x.equipped === equipped)
    );
  }
  addItemToInventory(server_id, user_id, item, type, count = 1) {
    const data = this.getData(server_id, user_id);

    if (!data.inventory.find((x) => x.id === item)) {
      this.database.push(
        `${server_id}-${user_id}`,
        {
          id: item,
          type,
          count,
          equipped: false,
        },
        "inventory"
      );
    } else {
      this.database.math(
        `${server_id}-${user_id}`,
        "+",
        count,
        `inventory.${data.inventory.findIndex((x) => x.id === item)}.count`
      );
    }
  }
  removeItemFromInventory(server_id, user_id, item, count = 1) {
    const data = this.getData(server_id, user_id);

    if (!data.inventory.find((x) => x.id === item)) return;

    this.database.math(
      `${server_id}-${user_id}`,
      "-",
      count,
      `inventory.${data.inventory.findIndex((x) => x.id === item)}.count`
    );

    if (
      this.database.get(
        `${server_id}-${user_id}`,
        `inventory.${data.inventory.findIndex((x) => x.id === item)}.count`
      ) <= 0
    ) {
      this.database.remove(
        `${server_id}-${user_id}`,
        (x) => x.id === item,
        "inventory"
      );
    }
  }

  equipItem(server_id, user_id, item) {
    const inventory = this.getInventory(server_id, user_id);

    if (!inventory.find((x) => x.id === item)) return;

    this.database.set(
      `${server_id}-${user_id}`,
      true,
      `inventory.${inventory.findIndex((x) => x.id === item)}.equipped`
    );
  }

  unequipItem(server_id, user_id, item) {
    const inventory = this.getInventory(server_id, user_id);

    if (!inventory.find((x) => x.id === item)) return;

    this.database.set(
      `${server_id}-${user_id}`,
      false,
      `inventory.${inventory.findIndex((x) => x.id === item)}.equipped`
    );
  }

  async addToBalance(server_id, user_id, amount) {
    await this.database.math(
      `${server_id}-${user_id}`,
      "+",
      amount,
      "stats.cash"
    );

    const currentBalance = this.getStat(server_id, user_id, "cash");
    const maxBalance = this.getStat(server_id, user_id, "max_cash") || 0;

    if (currentBalance > maxBalance) {
      this.setStat(server_id, user_id, "max_cash", currentBalance);
      let xp = 0;
      if (maxBalance > 50_000_000) return;
      if (currentBalance > 50_000_000) xp = 5000;
      else if (currentBalance > 15_000_000) xp = 2000;
      else if (currentBalance > 5_000_000) xp = 2000;
      else if (currentBalance > 3_000_000) xp = 1000;
      else if (currentBalance > 1_000_000) xp = 1000;
      else if (currentBalance > 500_000) xp = 500;
      else if (currentBalance > 100_000) xp = 500;

      if (xp) {
        const curr = this.getStat(server_id, user_id, "xp");
        this.setStat(server_id, user_id, "xp", curr + xp);
      }
    }
  }
  async setBalance(server_id, user_id, amount) {
    await this.database.set(`${server_id}-${user_id}`, amount, "stats.cash");
  }
  async removeFromBalance(server_id, user_id, amount) {
    await this.database.math(
      `${server_id}-${user_id}`,
      "-",
      amount,
      "stats.cash"
    );
  }
  async addToBank(server_id, user_id, amount) {
    await this.database.math(
      `${server_id}-${user_id}`,
      "+",
      amount,
      "stats.bank"
    );
  }
  async removeFromBank(server_id, user_id, amount) {
    await this.database.math(
      `${server_id}-${user_id}`,
      "-",
      amount,
      "stats.bank"
    );
  }
  async addToGambled(server_id, user_id, amount) {
    await this.database.math(
      `${server_id}-${user_id}`,
      "+",
      amount,
      "stats.gambled"
    );
  }
  async deposit(server_id, user_id, amount) {
    this.removeFromBalance(server_id, user_id, amount);
    this.addToBank(server_id, user_id, amount);
  }
  async withdraw(server_id, user_id, amount) {
    this.removeFromBank(server_id, user_id, amount);
    this.addToBalance(server_id, user_id, amount);
  }
  async transfer(server_id, user_id1, user_id2, amount) {
    this.removeFromBalance(server_id, user_id1, amount);
    this.addToBalance(server_id, user_id1, amount);
  }

  async daily(server_id, user_id) {
    this.addToBalance(server_id, user_id, this.client.config.economy.daily);
    this.database.set(
      `${server_id}-${user_id}`,
      Date.now() + 86400000,
      "cooldowns.nextDaily"
    );
  }
  async weekly(server_id, user_id) {
    this.addToBalance(server_id, user_id, this.client.config.economy.weekly);
    this.database.set(
      `${server_id}-${user_id}`,
      Date.now() + 86400000 * 7,
      "cooldowns.nextWeekly"
    );
  }
  async crime(server_id, user_id, success) {
    let robbed =
      Math.floor(Math.random() * this.client.config.economy.max_rob_earn) + 1;
    let message;

    if (success) {
      message = this.client.config.economy.rob.success_messages[
        Math.floor(
          Math.random() * this.client.config.economy.rob.success_messages.length
        )
      ].replace(/{amount}/g, robbed);
      this.addToBalance(server_id, user_id, robbed);
    } else {
      message = this.client.config.economy.rob.fail_messages[
        Math.floor(
          Math.random() * this.client.config.economy.rob.fail_messages.length
        )
      ].replace(/{amount}/g, robbed);
      this.removeFromBalance(server_id, user_id, robbed);
    }

    return { message };
  }

  async work(server_id, user_id) {
    const jobs = this.client.config.economy.jobs;

    const job = jobs[Math.floor(Math.random()) * jobs.length];

    const earnings = Math.floor(Math.random() * 1000);

    await this.addToBalance(server_id, user_id, earnings);
    await this.database.set(
      `${server_id}-${user_id}`,
      Date.now() + 90000,
      "cooldowns.nextWork"
    );

    return { job, earnings };
  }

  cooldown(server_id, user_id, type, time) {
    const data = this.getData(server_id, user_id);

    if (!data.cooldowns[type] || data.cooldowns[type] < Date.now()) {
      this.database.set(
        `${server_id}-${user_id}`,
        Date.now() + time,
        `cooldowns.${type}`
      );
      return false;
    } else {
      return true;
    }
  }

  getStat(server_id, user_id, stat) {
    return this.database.get(`${server_id}-${user_id}`, `stats.${stat}`);
  }

  setStat(server_id, user_id, stat, value) {
    this.database.set(`${server_id}-${user_id}`, value, `stats.${stat}`);
  }

  hasAchievement(server_id, user_id, achievement) {
    return this.database.get(
      `${server_id}-${user_id}`,
      `achievements.${achievement}`
    );
  }

  addAchievement(server_id, user_id, achievement, xp) {
    if (this.hasAchievement(server_id, user_id, achievement)) return;

    const user = this.client.users.cache.get(user_id);
    if (user) {
      user
        .send({
          embeds: [
            new DefaultEmbed({
              title: "Achievement Unlocked",
              description: `You have unlocked the **${achievement.replace(
                /^_*(.)|_+(.)/g,
                (s, c, d) => (c ? c.toUpperCase() : " " + d.toUpperCase())
              )}** achievement and gained **${xp} xp**!`,
            }),
          ],
        })
        .catch(() => {});
    }

    this.database.math(`${server_id}-${user_id}`, "+", xp, "stats.xp");
    this.database.set(
      `${server_id}-${user_id}`,
      true,
      `achievements.${achievement}`
    );
  }

  getContracts(server_id) {
    return this.contracts.get(server_id) || [];
  }

  setContracts(server_id, contracts) {
    this.contracts.set(server_id, contracts);
  }

  addContract(server_id, contract) {
    const contracts = this.getContracts(server_id);
    contracts.push(contract);
    this.setContracts(server_id, contracts);
  }

  getBlackmarket(server_id) {
    return this.blackmarket.get(server_id) || [];
  }

  setBlackmarket(server_id, items) {
    this.blackmarket.set(server_id, items);
  }

  addBlackmarketItem(server_id, item) {
    const items = this.getBlackmarket(server_id);
    items.push(item);
    this.setBlackmarket(server_id, items);
  }

  getBlackmarketItem(server_id, item_id) {
    const items = this.getBlackmarket(server_id);
    return items.find((item) => item.id === item_id);
  }

  setBlackmarketItem(server_id, item_id, item) {
    const items = this.getBlackmarket(server_id);
    const index = items.findIndex((item) => item.id === item_id);
    if (index !== -1) items[index] = item;
    this.setBlackmarket(server_id, items);
  }

  removeBlackmarketItem(server_id, item_id) {
    const items = this.getBlackmarket(server_id);
    const index = items.findIndex((item) => item.id === item_id);
    if (index !== -1) items.splice(index, 1);
    this.setBlackmarket(server_id, items);
  }

  setBlackmarketBidder(server_id, item_id, bidder, bid) {
    const item = this.getBlackmarketItem(server_id, item_id);
    item.bidder = bidder;
    item.currentBid = bid;
    this.setBlackmarketItem(server_id, item_id, item);
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

  searchSpecialItem(message) {
    const item = this.randomSpecialItem();
    if (!item) return null;

    this.client.plugins.economy.addItemToInventory(
      message.guild.id,
      message.author.id,
      item.id,
      "item"
    );

    message.reply({
      embeds: [
        new DefaultEmbed({
          title: "Special Item Found!",
          description: `You found a **${item.name}**!`,
        }),
      ],
    });
  }

  randomSpecialItem() {
    const items = [];
    for (const item of this.client.config.economy.special_items) {
      if (Math.random() < item.rate / 100) items.push(item);
    }
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  parseAmount(amount, server_id, user_id) {
    const userCurrencyName = this.database.get(`${server_id}-${user_id}`, "userCurrencyName");
    const serverCurrencyName = this.database.get(server_id, "serverCurrencyName") || this.client.config.economy.defaultCurrencyName;
    const currencyName = userCurrencyName || serverCurrencyName;
    return parseInt(amount).toLocaleString() + ' ' + currencyName;
  }
}

module.exports = EconomyPlugin;
