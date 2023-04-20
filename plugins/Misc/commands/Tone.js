const { Command } = require("../../../structures");
const { DefaultEmbed } = require("../../../embeds");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "tone",
      aliases: [],
      syntax: "tone [text]",
      example: 'tone This is a test',
      enabled: true,
      about: 'Analyze the tone of a text using Google Perspective API',
    });
  }

  async execute(message, args) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

    let text;

    if (message.reference && message.reference.messageID) {
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageID);
      text = repliedMessage.content;
    } else {
      text = args.join(' ');
    }

    if (!text) {
      return message.reply('Please provide a text or reply to a message to analyze.');
    }

    const requestBody = {
      comment: {
        text: text,
      },
      requestedAttributes: {
        SEVERE_TOXICITY: {},
      },
      languages: ['en'],
      doNotStore: true,
    };

    try {
      const response = await fetch(apiUrl + `?key=${apiKey}`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();

      if (!json.attributeScores) {
        console.error('API Response:', json);
        throw new Error('Error analyzing text.');
      }

      function getColorFromScore(score) {
        const lowToxicityColor = [172, 236, 124];
        const highToxicityColor = [244, 104, 106];
      
        const interpolatedColor = lowToxicityColor.map((value, index) => {
          return value + Math.round((highToxicityColor[index] - value) * score);
        });
      
        return `#${interpolatedColor.map(value => value.toString(16).padStart(2, '0')).join('')}`;
      }

      const toxicityScore = json.attributeScores.SEVERE_TOXICITY.summaryScore.value;
      const embed = new DefaultEmbed()
      .setTitle('Text Tone Analysis')
      .addFields(
        { name: 'Text', value: text },
        { name: 'Toxicity Score', value: `${(toxicityScore * 100).toFixed(2)}%` }
      )
      .setColor(getColorFromScore(toxicityScore))
      .setFooter({ text: `Powered by Google Perspective`, iconURL: "https://www.google.com/favicon.ico" });

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Failed to analyze the text. Please try again.');
    }
  }
};
