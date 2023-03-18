const { Event } = require("../../../structures/");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageReactionAdd",
      enabled: true,
    });
  }

  formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  async run(reaction, user) {
    if (user.bot) return;
    if (!reaction.message.embeds[0]) return;
    if (!reaction.message.embeds[0].footer || reaction.message.embeds[0].footer.text !== "react with your answer") return;

    let blueCount = reaction.message.blueCount;
    let redCount = reaction.message.redCount;

    const newEmbed = new DefaultEmbed()
      .setAuthor(reaction.message.embeds[0].author)
      .setColor("#4289c1")
      .setFooter({ text: "react with your answer" });

    if (reaction.emoji.name === "1️⃣") {
      blueCount += 1;

      const otherReaction = reaction.message.reactions.cache.find(r => r.emoji.name === "2️⃣");
      if (otherReaction && otherReaction.users.cache.has(user.id)) {
        redCount -= 1;
        await otherReaction.users.remove(user.id);
      }

      newEmbed.setDescription(
        `:one: ${reaction.message.blueQuestion} - \`${this.formatNumberWithCommas(blueCount)} answered\`\n\n**OR**\n\n:two: ${reaction.message.redQuestion} - \`${this.formatNumberWithCommas(redCount)} answered\``
      );

      reaction.message.edit({ embeds: [newEmbed] });
    } else if (reaction.emoji.name === "2️⃣") {
      redCount += 1;

      const otherReaction = reaction.message.reactions.cache.find(r => r.emoji.name === "1️⃣");
      if (otherReaction && otherReaction.users.cache.has(user.id)) {
        blueCount -= 1;
        await otherReaction.users.remove(user.id);
      }

      newEmbed.setDescription(
        `:one: ${reaction.message.blueQuestion} - \`${this.formatNumberWithCommas(blueCount)} answered\`\n\n**OR**\n\n:two: ${reaction.message.redQuestion} - \`${this.formatNumberWithCommas(redCount)} answered\``
      );

      reaction.message.edit({ embeds: [newEmbed] });
    }
  }
};
