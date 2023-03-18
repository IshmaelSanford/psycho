const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");
const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "vote-poll",
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("vote-poll")
        .setDescription("Create Vote Poll")
        .setDefaultMemberPermissions(8)
        .addChannelOption((channel) =>
          channel
            .setName("results_channel")
            .setDescription("Results Channel")
            .setRequired(true)
        )
        .addStringOption((str) =>
          str
            .setName("duration")
            .addChoices(
              {
                name: "30 minutes",
                value: "30m",
              },
              {
                name: "1 hour",
                value: "1h",
              },
              {
                name: "6 hours",
                value: "6h",
              },
              {
                name: "1 day",
                value: "1d",
              },
              {
                name: "3 days",
                value: "3d",
              },
              {
                name: "1 week",
                value: "1w",
              }
            )
            .setDescription("Duration")
            .setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("question").setDescription("Question").setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("option_1").setDescription("Option 1").setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("option_2").setDescription("Option 2").setRequired(true)
        )
        .addStringOption((str) =>
          str.setName("option_3").setDescription("Option 3").setRequired(false)
        )
        .addStringOption((str) =>
          str.setName("option_4").setDescription("Option 4").setRequired(false)
        )
        .addStringOption((str) =>
          str.setName("option_5").setDescription("Option 5").setRequired(false)
        )
        .addStringOption((str) =>
          str.setName("option_6").setDescription("Option 6").setRequired(false)
        )
        .addStringOption((str) =>
          str.setName("option_7").setDescription("Option 7").setRequired(false)
        )
        .addStringOption((str) =>
          str.setName("option_8").setDescription("Option 8").setRequired(false)
        )
        .addStringOption((str) =>
          str.setName("option_9").setDescription("Option 9").setRequired(false)
        )
        .addStringOption((str) =>
          str
            .setName("option_10")
            .setDescription("Option 10")
            .setRequired(false)
        ),
    });
  }
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    let results_channel = interaction.options.getChannel(
      "results_channel",
      true
    );

    let duration = interaction.options.getString("duration", true);

    let question = interaction.options.getString("question", true);

    let option1 = interaction.options.getString("option_1", true);
    let option2 = interaction.options.getString("option_2", true);

    let option3 = interaction.options.getString("option_3", false);
    let option4 = interaction.options.getString("option_4", false);
    let option5 = interaction.options.getString("option_5", false);
    let option6 = interaction.options.getString("option_6", false);
    let option7 = interaction.options.getString("option_7", false);
    let option8 = interaction.options.getString("option_8", false);
    let option9 = interaction.options.getString("option_9", false);
    let option10 = interaction.options.getString("option_10", false);

    let description = `\n1️⃣ ${option1}
    \n2️⃣ ${option2}\n`;

    if (option3) description += `\n 3️⃣ ${option3}\n `;
    if (option4) description += `\n 4️⃣ ${option4}\n `;
    if (option5) description += `\n 5️⃣ ${option5}\n `;
    if (option6) description += `\n 6️⃣ ${option6}\n `;
    if (option7) description += `\n 7️⃣ ${option7}\n `;
    if (option8) description += `\n 8️⃣ ${option8}\n `;
    if (option9) description += `\n 9️⃣ ${option9}\n `;
    if (option10) description += `\n 🔟 ${option10}\n `;

    if (duration)
      description += `\n ⏰ Ends: <t:${Math.floor(
        (Date.now() + ms(duration)) / 1000
      )}:R>`;

    const embed = new DefaultEmbed()
      .setTitle(`📊 Vote Poll | ${question}`)
      .setDescription(description);

    const msg = await interaction.editReply({ embeds: [embed] });

    let optionAmount = 2;

    await msg.react("1️⃣");
    await msg.react("2️⃣");
    if (option3) {
      await msg.react("3️⃣");
      optionAmount++;
    }
    if (option4) {
      await msg.react("4️⃣");
      optionAmount++;
    }
    if (option5) {
      await msg.react("5️⃣");
      optionAmount++;
    }
    if (option6) {
      await msg.react("6️⃣");
      optionAmount++;
    }
    if (option7) {
      await msg.react("7️⃣");
      optionAmount++;
    }
    if (option8) {
      await msg.react("8️⃣");
      optionAmount++;
    }
    if (option9) {
      await msg.react("9️⃣");
      optionAmount++;
    }
    if (option10) {
      await msg.react("🔟");
      optionAmount++;
    }

    this.client.plugins.votepolling.create(
      msg.channel.id,
      msg.id,
      results_channel.id,
      question,
      Date.now() + ms(duration),
      optionAmount
    );
  }
};
