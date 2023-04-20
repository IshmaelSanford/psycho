const { Command } = require("../../../structures");
const { DefaultEmbed, SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { MessageActionRow, MessageButton } = require("discord.js");
const axios = require("axios");

const activeGames = new Set();

function shuffleString(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

class Player {
  constructor(user) {
    this.user = user;
    this.lives = 2;
  }
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "bentobox",
      aliases: ['bento', 'bb'],
      enabled: true,
      syntax: "bentobox",
      about: "Play a word-guesser game with other players.",
      example: "bentobox",
    });
  }

  async execute(message) {
    if (message.content.includes("--rules")) {
      const rulesEmbed = new DefaultEmbed()
        .setTitle("🍱 Bento Box Game Rules")
        .addFields(
          { name: `Objective:`, value: `You have **10** seconds to come up with a word that includes the given set of **3** letters. If you fail to do so within the time limit, you will lose one life.`, inline: false },
          { name: "Fax:", value: `Each player has **2** lives to begin with.`, inline: false },
          { name: "Note:", value: `*A word can only be used **once** through the course of the game*`, inline: false }
        )
        .setColor('#ab0818');
      return message.channel.send({ embeds: [rulesEmbed] });
    }

    if (activeGames.has(message.channel.id)) {
      const errorEmbed = new ErrorEmbed({
        description: 'Please wait for the current game to finish.',
      }, message);
      return message.channel.send({ embeds: [errorEmbed] });
    }
    activeGames.add(message.channel.id);

    const players = new Set();
    const usedWords = new Set();
    const joinReaction = "🍙";
    const minPlayers = 2;

    const gifPath = './assets/images/bentobox.gif';

    const joinMessage = await message.channel.send({ files: [gifPath] });
    await joinMessage.react(joinReaction);

    const filter = (reaction, user) => reaction.emoji.name === joinReaction && !user.bot;
    const collector = joinMessage.createReactionCollector({ filter, time: 30000 });

    collector.on("collect", (reaction, user) => {
      players.add(new Player(user));
    });

    collector.on("end", async () => {
      if (players.size < minPlayers) {
        activeGames.delete(message.channel.id);
        const notEnoughPlayersEmbed = new ErrorEmbed({
          description: `Not enough players joined the game to start.`,
        }, message);
        return message.channel.send({ embeds: [notEnoughPlayersEmbed] });
      }

      // Start the game
      await this.playGame(message, players, usedWords);
    });
  }

  async playGame(message, players, usedWords) {
    for (const currentPlayer of players) {
      const letters = this.generateLetters();
      const wordPromptEmbed = new DefaultEmbed()
        .setDescription(`🍙 Type a word containing the letters: **${letters}**`)
        .setColor(`#d4d9dd`);

  
      const wordPrompt = await message.channel.send({ content: `${currentPlayer.user}`, embeds: [wordPromptEmbed] });
  
      let correctWordFound = false;
      let timeElapsed = 0;
  
      while (!correctWordFound && timeElapsed < 15000) {
        const filter = m => m.author.id === currentPlayer.user.id && this.isValidWord(m.content, letters);
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 2000 });
      
        if (collected.size > 0) {
          const word = collected.first().content.toUpperCase();
      
          if (!usedWords.has(word) && await this.checkWord(word)) {
            correctWordFound = true;
            usedWords.add(word);
            await collected.first().react('✅');
          }
        } else {
          timeElapsed += 2000;
          if (timeElapsed === 10000) await wordPrompt.react("3️⃣");
          if (timeElapsed === 12000) await wordPrompt.react("2️⃣");
          if (timeElapsed === 14000) await wordPrompt.react("1️⃣");
        }
      }

      if (!correctWordFound) {
        currentPlayer.lives--;
        await this.updateLives(message, currentPlayer);
      }
    }
  
    const remainingPlayers = Array.from(players).filter(player => player.lives > 0);
  
    if (remainingPlayers.length > 1) {
      await this.playGame(message, remainingPlayers, usedWords);
    } else {
      const winner = remainingPlayers[0];
      const winnerEmbed = new DefaultEmbed()
        .setDescription(`🏆 **${winner.user.username}** has won the game!`)
        .setColor(`#ffaf31`);
      message.channel.send({ embeds: [winnerEmbed] });

      activeGames.delete(message.channel.id);
    }
  }
  

  generateLetters() {
    const commonLetterGroups = [
      "ENT", "AUT", "ING", "EST", "TED", "IES", "ATE", "ION", "ERS", "RAT",
      "ANT", "TRA", "INT", "TER", "TIO", "ARI", "OPE", "UND", "RES", "STA",
      "CON", "COM", "PRO", "PRE", "PER", "MAN", "CAL", "MIN", "PHY", "ART",
      "VER", "FOR", "REL", "DEM", "REF", "RET", "SUB", "SUP", "CON", "SEN",
    ];
  
    const letterGroup = commonLetterGroups[Math.floor(Math.random() * commonLetterGroups.length)];
    return shuffleString(letterGroup);
  }

  isValidWord(word, letters) {
    return letters.split("").every(letter => word.toUpperCase().includes(letter));
  }

  async checkWord(word) {
    try {
      const apiKey = 'a40197c234msh1c11a88e44418bap1841bejsn494631037b10';
      const response = await axios.get(`https://wordsapiv1.p.rapidapi.com/words/${word}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
        },
      });
  
      return response.data && response.data.word;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      console.error("Error fetching word from WordsAPI:", error);
      return false;
    }
  }

  async updateLives(message, player) {
    const livesMessage = player.lives > 0
      ? `💥 Time's up, ${player.user.username} has ${player.lives} life${player.lives > 1 ? 's' : ''} remaining!`
      : `💣 ${player.user.username} has been eliminated!`;

    const livesEmbed = new DefaultEmbed()
      .setDescription(`${livesMessage}`)
      .setColor(`#ef4e17`);

    await message.channel.send({ embeds: [livesEmbed] });
  }
}
