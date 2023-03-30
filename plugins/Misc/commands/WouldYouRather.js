const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const { default: wyr } = require("wyr");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "wouldyourather",
      enabled: false,
      aliases: ["wyr"],
    });
  }

  formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  async execute(message) {
    const { blue, red } = await wyr();
    const blueQuestion = blue.question;
    const redQuestion = red.question;
    const blueCount = Math.floor(Math.random() * (2000000 - 100000) + 100000);
    const redCount = Math.floor(Math.random() * (2000000 - 100000) + 100000);

    const embed = new DefaultEmbed()
      .setAuthor({
        name: `Asked by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(
        `:one: ${blueQuestion} - \`${this.formatNumberWithCommas(blueCount)} answered\`\n\n**OR**\n\n:two: ${redQuestion} - \`${this.formatNumberWithCommas(redCount)} answered\``
      )
      .setColor("#4289c1")
      .setFooter({ text: "react with your answer" });

    const sentMessage = await message.reply({
      embeds: [embed],
    });

    sentMessage.blueQuestion = blueQuestion;
    sentMessage.redQuestion = redQuestion;
    sentMessage.blueCount = blueCount;
    sentMessage.redCount = redCount;

    await sentMessage.react("1️⃣");
    await sentMessage.react("2️⃣");
  }
};
