const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  WarnEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { getColorFromURL } = require("color-thief-node");
const { PermissionFlagsBits } = require("discord.js");
const { Mal } = require("node-myanimelist");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "anime",
      enabled: true,
      syntax: "anime <animename>",
      about: "Display information about a given anime",
    });
  }

  async execute(message, args) {
    if (args.length === 0) {
      return message.channel.send({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }
  
    const query = args.join(" ");
    const appId = "3cbb1a35f9f4a6bd50847a970bb25f6b";
  
    try {
      const auth = Mal.auth(appId);
      const account = await auth.Unstable.login("shortyqt", "psycho4L!");
  
      const searchResults = await account.anime.search(
        query,
        Mal.Anime.fields().all()
      ).call();
  
      let currentIndex = 0;
      if (args[0].toLowerCase() === "random") {
        currentIndex = Math.floor(Math.random() * searchResults.data.length);
      }
  
      async function displayAnime(index) {
        const anime = searchResults.data[index].node;
        let color;
        try {
          color = await getColorFromURL(anime.main_picture.large);
        } catch (err) {
          console.error(`Error while processing image: ${err.message}`);
          color = "#23272A"; // Discord default color or any other fallback color
        }
  
        const startDateTimestamp = Math.floor(new Date(anime.start_date).getTime() / 1000);
        const endDateTimestamp = anime.end_date ? Math.floor(new Date(anime.end_date).getTime() / 1000) : null;
  
        return new DefaultEmbed({ title: anime.title }, message)
          .setColor(color)
          .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setDescription(anime.synopsis)
          .setThumbnail(anime.main_picture.large)
          .addFields(
            { name: "**Type**", value: anime.media_type.toString(), inline: true },
            { name: "**Episodes**", value: anime.num_episodes.toString(), inline: true },
            { name: "**Score**", value: `⭐ ${anime.mean.toString()}`, inline: true },
            { name: "**Start Date**", value: `<t:${startDateTimestamp}:D>`, inline: true },
            { name: "**End Date**", value: endDateTimestamp ? `<t:${endDateTimestamp}:D>` : "Ongoing", inline: true },
            { name: "**Rated**", value: anime.rating, inline: true },
            { name: "**Status**", value: anime.status, inline: true },
            { name: "**Popularity**", value: `#${anime.popularity}`, inline: true },
            { name: "**Members**", value: anime.num_list_users.toString(), inline: true },
            { name: "**URL**", value: `[click here](https://myanimelist.net/anime/${anime.id})`, inline: true }
          )
          .setFooter({ text: `Page ${index + 1}/${searchResults.data.length} from MyAnimeList.com`, iconURL: "https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png" });
        }
        const sentMessage = await message.channel.send({ embeds: [await displayAnime(currentIndex)] });

        // Add reactions for pagination
        await sentMessage.react("⬅️");
        await sentMessage.react("➡️");
        
        const filter = (reaction, user) => {
          return ["⬅️", "➡️"].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        
        const collector = sentMessage.createReactionCollector({ filter, time: 60000 });
        
        collector.on("collect", async (reaction, user) => {
          reaction.users.remove(user.id);
        
          if (reaction.emoji.name === "⬅️") {
            if (currentIndex > 0) {
              currentIndex -= 1;
              const newEmbed = await displayAnime(currentIndex);
              sentMessage.edit({ embeds: [newEmbed] });
            }
          } else if (reaction.emoji.name === "➡️") {
            if (currentIndex < searchResults.data.length - 1) {
              currentIndex += 1;
              const newEmbed = await displayAnime(currentIndex);
              sentMessage.edit({ embeds: [newEmbed] });
            }
          }
        });
        
        collector.on("end", () => {
          sentMessage.reactions.removeAll();
        });
      } catch (error) {
        console.error(error);
        message.channel.send({
        embeds: [new WarnEmbed({ description: "Error **410**; fetching anime information" }, message)],
        });
      }
    }
  }