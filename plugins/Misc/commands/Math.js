const { Command } = require("../../../structures");
const { DefaultEmbed, ErrorEmbed } = require("../../../embeds");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "math",
      enabled: true,
      aliases: ['maths'],
      syntax: "math <problem>",
      about: "Solve math problems using Wolfram Alpha",
      example: "math 2+2",
    });
  }

  async execute(message, args) {
    const query = args.join(" ");
  
    if (!query) {
      return message.reply("Please provide a math problem to solve.");
    }
  
    const apiKey = process.env.WOLFRAM_API_KEY;
    const apiUrl = `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext&output=XML&appid=${apiKey}`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.text();
      const xml2js = require("xml2js");
      const parser = new xml2js.Parser();
  
      parser.parseString(data, (err, result) => {
        if (err) {
          console.error(err);
          return message.reply("An error occurred while parsing the API response.");
        }
  
        const pods = result.queryresult.pod;
        const solutionPod = pods.find(pod => pod.$.title === "Solution" || pod.$.title === "Result");

        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);
  
        if (solutionPod) {
          const answer = solutionPod.subpod[0].plaintext[0];
          const embed = new DefaultEmbed()
            .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTitle("Solved")
            .addFields(
              { name: "Problem", value: query, inline: true },
              { name: "Answer", value: answer, inline: true }
            )
            .setColor(member.displayColor === 0 ? "#0073E6" : member.displayColor)
            .setFooter({ text: `Wolfram Alpha`, iconURL: "https://icon-library.com/images/wolfram-alpha-icon/wolfram-alpha-icon-17.jpg" });
          return message.channel.send({ embeds: [embed] });
        } else {
          return message.reply({
            embeds: [new ErrorEmbed({ description: `Couldn't solve this problem` }, message)],
          });
        }
      });
    } catch (error) {
      console.error(error);
      return message.reply("An error occurred while trying to solve the math problem.");
    }
  }
};