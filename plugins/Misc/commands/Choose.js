const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const {
  WrongSyntaxEmbed,
} = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "choose",
      enabled: true,
      aliases: ['pick'],
      syntax: 'choose <option1> or <option2> etc...',
      example: 'choose apples or banannas',
      about: 'Let the bot choose for you',
    });
  }

  async execute(message, args) {
    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
  
    const choices = args.join(' ').split(' or ');
    const pick = choices[Math.floor(Math.random() * choices.length)];
  
    const thinkingEmbed = new DefaultEmbed().setDescription("🤔 *thinking...*");
    const messageWithEmbed = await message.channel.send({ embeds: [thinkingEmbed] });
  
    const delay = Math.floor(Math.random() * 10000) + 2000; // Random delay between 8 to 10 seconds
    const startTime = Date.now();

    // Start typing
    message.channel.sendTyping();

    setTimeout(async () => {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      const elapsedTimeInSeconds = elapsedTime / 1000;
      const formattedElapsedTime = elapsedTimeInSeconds.toFixed(2);
      
    
      const choicesList = choices.map((choice, index) => `${index + 1}. ${choice}`).join('\n');
      const resultEmbed = new DefaultEmbed()
        .setAuthor({
          name: `Asked by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`I've decided!`)
        .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`)
        .setDescription(`My choices were:\n${choicesList}\n\nI picked ||${pick}||`)
        .setFooter({ text: `Completed in ${formattedElapsedTime} seconds`, iconURL: message.client.user.displayAvatarURL({ dynamic: true }) });
      await messageWithEmbed.edit({ embeds: [resultEmbed] });
    }, delay);
  }
}
