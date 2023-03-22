const { Command } = require("../../../structures");
const { DefaultEmbed, WrongSyntaxEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "ship",
      aliases: ["compatibility"],
      enabled: true,
      syntax: "ship <user1> [user2]",
      about: 'See the compatibility of two users',
    });
  }

  createProgressBar(percentage) {
    const filledBoxes = Math.round((percentage * 10) / 100);
    const emptyBoxes = 10 - filledBoxes;
    const progressBar = [
      filledBoxes === 0
        ? "<:white_rounded_start:1086135436893753384>"
        : filledBoxes === 1
        ? "<:blue_rounded_start_mid:1086134319048835172>"
        : "<:blue_rounded_start:1086127913180598342>",
      ...Array(filledBoxes - (filledBoxes <= 1 || filledBoxes === 10 ? 1 : 2)).fill("<:blue_box:1086126408193032292>"),
      filledBoxes > 1 && filledBoxes < 10 ? "<:blue_rounded_mid:1086127912303988766>" : "",
      ...Array(Math.max(emptyBoxes - (filledBoxes === 10 ? 1 : 0), 0)).fill("<:white_box:1086126412760612926>"),
      filledBoxes === 10 ? "<:blue_rounded_end:1086127854468735136>" : "<:white_rounded_end:1086127854468735136>",
    ].join("");
    return progressBar;
  }

  async execute(message, args) {
    const user1 = message.mentions.members.first();
    const user2 = message.mentions.members.size > 1 ? [...message.mentions.members.values()][1] : null;
  
    if (!user1)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
  
    const shippingUser1 = user2 ? user1 : message.member;
    const shippingUser2 = user2 ? user2 : user1;
  
    let percentage = Math.floor(Math.random() * 100);
    const progressBar = this.createProgressBar(percentage);
  
    const embed = new DefaultEmbed()
      .setTitle(`✨ Compatibility of ${shippingUser1.displayName} and ${shippingUser2.displayName}`)
      .setDescription(
        `${shippingUser1} and ${shippingUser2} have a ♥ **${percentage}%** ♥ chance of love \n\n${progressBar}`
      );
  
    await message.channel.send({ embeds: [embed] });
  }  
};
