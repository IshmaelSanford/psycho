module.exports = {
  owner_ids: ["398301517339426837"],
  supporterGuildId: "1071561978742571100",
  defaultPrefix: ",",
  presence: {
    // status: "dnd",
    activities: [
      {
        name: "Psycho Syndicate",
        type: 5, // 0 - 5
      },
    ],
  },
  leveling: {
    color: "#0096ff",
  },
  economy: {
    defaultCurrencyName: "credits",
    max_rob_earn: 100,
    jobs: [
      // job names for /work command
      "Doctor",
      "Policeman",
      "Firefighter",
      "Programmer",
      "Manager",
      "Artist",
      "Cleaner",
    ],
    rob: {
      success_messages: [`You robbed a bank and got away with \${amount}`],
      fail_messages: [
        `You tried to rob a bank but got caught and got \${amount} in fines`,
      ],
    },
    daily: 1000, // daily reward income
    weekly: 5000, // weekly reward income
    drop_reward: 10000, // reward for random drops
    special_items: [
      {
        emoji: "🖤",
        name: "Black Cat",
        description: "You can't be killed",
        id: "black_cat",
        uses: 1,
        rate: 0.45,
      },
      {
        emoji: "⚗️",
        name: "Holy Water",
        description: "Pray earnings are doubled",
        id: "holy_water",
        uses: 0,
        rate: 0.1,
      },
      {
        emoji: "🗝️",
        name: "Old Key",
        description: "Open an old create",
        id: "old_key",
        uses: 1,
        rate: 0.1,
      },
      {
        emoji: "🛡️",
        name: "Heavy Shield",
        description: "You can't be robbed",
        id: "heavy_shield",
        uses: 1,
        rate: 0.1,
      },
      {
        emoji: "🍀",
        name: "Lucky Clover",
        description: "Casino games are 5% luckier",
        id: "lucky_clover",
        uses: 0,
        rate: 0.02,
      },
      {
        emoji: "🧧",
        name: "Ruby Charm",
        description: "0.1% change to gain a fortune from earn commands",
        id: "ruby_charm",
        uses: 0,
        rate: 0.1,
      },
      {
        emoji: "🕷️",
        name: "Charlotte",
        description: "Robbing someone has a 3% higher chance to succeed",
        id: "charlotte",
        uses: 0,
        rate: 0.1,
      },
      {
        emoji: "🎲",
        name: "Snake Eyes",
        description: "Small chance to double rewards from any command",
        id: "snake_eyes",
        uses: 0,
        rate: 0.004,
      },
      {
        emoji: "⚰️",
        name: "Laughing Coffin",
        description:
          "Killing players is 6.66% more effective and your loses are halved",
        id: "laughing_coffin",
        uses: 0,
        rate: 0.004,
      },
      {
        emoji: "🧲",
        name: "Grabber 3000",
        description:
          "When viewing someone's balance, you have a chance to steal some of their money",
        id: "grabber",
        uses: 0,
        rate: 0.05,
      },
      {
        emoji: "📿",
        name: "Divine Protection",
        description: "You can't get robbed. You should be worried about dying.",
        id: "divine_protection",
        uses: 0,
        rate: 0.004,
      },
      {
        emoji: "🔮",
        name: "Near Death",
        description: "Killing only has a 5% chance to work on you",
        id: "near_death",
        uses: 0,
        rate: 0.004,
      },
      {
        emoji: "📟",
        name: "Cyber Ghost",
        description: "Hacking a user has a 90% success rate",
        id: "cyber_ghost",
        uses: 0,
        rate: 0.004,
      },
    ],
  },
};
