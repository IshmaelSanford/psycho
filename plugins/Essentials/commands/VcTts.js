const { Command } = require("../../../structures");
const { SuccessEmbed, WarnEmbed, ErrorEmbed } = require("../../../embeds");
const gtts = require("gtts");
const fs = require("fs");

let userInControl = null;
let activeDispatcher;

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "vctts",
      enabled: true,
      aliases: [],
      syntax: "vctts <text>",
      about: "Speak the given text in a voice channel using TTS",
    });
  }

  async execute(message, args) {
    if (userInControl) {
      return message.channel.send({
        embeds: [new WarnEmbed({ description: `Someone else is using tts` }, message)],
      });
    }

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.channel.send({
        embeds: [new ErrorEmbed({ description: `You must be in a voice channel` }, message)],
      });
    }

    userInControl = message.author.id;

    message.channel.send({
      embeds: [new SuccessEmbed({ description: `*You are now in controll of tts. Type your messages in chat` }, message)],
    });

    const messageHandler = async (msg) => {
      if (msg.author.id !== userInControl || msg.channel.id !== message.channel.id) return;

      const text = msg.content;
      const gttsInstance = new gtts(text, "en");

      const fileName = `tts-${msg.author.id}.mp3`;

      gttsInstance.save(fileName, (err, _result) => {
        if (err) {
          console.error(err);
          return msg.channel.send({
            embeds: [new ErrorEmbed({ description: `tts error code **404**: content not found` }, message)],
          });
        }

        voiceChannel.join().then((connection) => {
          activeDispatcher = connection.play(fs.createReadStream(fileName));

          activeDispatcher.on("finish", () => {
            fs.unlinkSync(fileName);
          });

          activeDispatcher.on("error", (error) => {
            console.error(error);
            return msg.channel.send({
              embeds: [new ErrorEmbed({ description: `tts error code **408**: timeout` }, message)],
            });
          });
        });
      });
    };

    message.client.on("messageCreate", messageHandler);

    const voiceStateUpdateHandler = (oldState, newState) => {
      if (newState.member.id !== userInControl) return;

      if (!newState.channel) {
        userInControl = null;
        if (message.guild.me.voice && message.guild.me.voice.channel) {
          if (activeDispatcher) {
            activeDispatcher.pause();
            activeDispatcher.destroy();
          }
          message.guild.me.voice.channel.leave();
        }
        message.client.removeListener("voiceStateUpdate", voiceStateUpdateHandler);
        message.client.removeListener("messageCreate", messageHandler);
      }
    };

    message.client.on("voiceStateUpdate", voiceStateUpdateHandler);
  }
};