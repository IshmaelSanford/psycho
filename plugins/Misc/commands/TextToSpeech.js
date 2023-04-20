const { Command } = require("../../../structures");
const { MessageAttachment } = require("discord.js");
const textToSpeech = require("@google-cloud/text-to-speech");

const client = new textToSpeech.TextToSpeechClient();

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "tts",
      aliases: ["texttospeech"],
      syntax: "tts [voice] <message>",
      example: 'tts "Hello, how are you?"',
      enabled: true,
      about: "Converts text to speech and sends an MP3 file",
    });
  }

  async execute(message, args) {
    if (args.length === 0) {
      return message.reply("Please provide a message for text to speech conversion.");
    }

    const voice = args[0];
    const text = args.slice(1).join(" ");

    const request = {
      input: { text: text },
      voice: { languageCode: "en-US", name: voice },
      audioConfig: { audioEncoding: "MP3" },
    };

    try {
      const [response] = await client.synthesizeSpeech(request);
      const audioContent = response.audioContent;
      const attachment = new MessageAttachment(audioContent, "tts.mp3");
      message.channel.send({ files: [attachment] });
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while generating the text to speech audio. Please try again.");
    }
  }
};