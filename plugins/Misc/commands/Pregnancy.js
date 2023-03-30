const { Command } = require("../../../structures");
const { DefaultEmbed, WrongSyntaxEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "pregnancy",
      aliases: ["preg"],
      enabled: true,
      syntax: "pregnancy <user>",
      about: 'Determine the pregnancy of a user',
    });
  }

  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    if (!user)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    let isPregnant = Math.random() < 0.5;
    let virginMary = Math.random() < 0.02;
    let noChance = Math.random() < 0.05;

    let result;

    if (isPregnant) {
      if (virginMary) {
        result = `Virgin Mary? Because there's absolutely no way ${user} is pregnant`;
      } else {
        let weeksPregnant = Math.floor(Math.random() * 43);
        if (weeksPregnant === 0) {
          let daysPregnant = Math.floor(Math.random() * 6) + 1;
          result = `${user} is **${daysPregnant} day${daysPregnant === 1 ? '' : 's'} pregnant**`;
        } else {
          result = `${user} is **${weeksPregnant} weeks pregnant**`;
        }
      }
    } else {
      if (noChance) {
        result = `bruh.\n${user} **DOES NOT PULL**. There is absolutely 0% chance they are pregnant.\n\nno bitches, no maidens, none`;
      } else {
        result = `${user} is **not pregnant**`;
      }
    }

    const embed = new DefaultEmbed()
      .setTitle(`<:pregnancytest:1088128558519558315> Pregnancy of ${user.username}`)
      .setColor('#7cb3eb')
      .setDescription(result);

    await message.channel.send({ embeds: [embed] });
  }
};