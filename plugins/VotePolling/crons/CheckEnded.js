const { DefaultEmbed } = require("../../../embeds");
const { Cron } = require("../../../structures");

module.exports = class extends Cron {
  constructor(client) {
    super(client, {
      enabled: true,
      format: "* * * * *",
    });
  }
  async execute() {
    const everything = await this.client.plugins.votepolling.getEverything();

    for (let [__id, data] of everything) {
      if (data.ended) continue;
      if (Date.now() < data.endsAt) continue;

      let channel = this.client.channels.cache.get(data.channel);
      if (!channel) continue;
      let msg = await channel.messages.fetch(__id);
      if (!msg) continue;

      let reactions = await msg.reactions.cache;

      let one = (await reactions.get("1️⃣").users.fetch()).size;
      let two = (await reactions.get("2️⃣").users.fetch()).size;
      let three = (await reactions.get("3️⃣")?.users.fetch())?.size;
      let four = (await reactions.get("4️⃣")?.users.fetch())?.size;
      let five = (await reactions.get("5️⃣")?.users.fetch())?.size;
      let six = (await reactions.get("6️⃣")?.users.fetch())?.size;
      let seven = (await reactions.get("7️⃣")?.users.fetch())?.size;
      let eight = (await reactions.get("8️⃣")?.users.fetch())?.size;
      let nine = (await reactions.get("9️⃣")?.users.fetch())?.size;
      let ten = (await reactions.get("🔟")?.users.fetch())?.size;

      let description = `1️⃣ **${one}** votes \n\n2️⃣ **${two}** votes\n`;
      let amount = data.optionsAmount;

      if (amount > 2) description += `\n3️⃣ **${three}** votes`;
      if (amount > 3) description += `\n4️⃣ **${four}** votes`;
      if (amount > 4) description += `\n5️⃣ **${five}** votes`;
      if (amount > 5) description += `\n6️⃣ **${six}** votes`;
      if (amount > 6) description += `\n7️⃣ **${seven}** votes`;
      if (amount > 7) description += `\n8️⃣ **${eight}** votes`;
      if (amount > 8) description += `\n9️⃣ **${nine}** votes`;
      if (amount > 9) description += `\n🔟 **${ten}** votes`;

      let results = this.client.channels.cache.get(data.results_channel);

      results?.send({
        embeds: [
          new DefaultEmbed()
            .setTitle(`📊 Vote Results | ${data.question}`)
            .setDescription(description),
        ],
      });

      await this.client.plugins.votepolling.end(__id);
    }
  }
};
