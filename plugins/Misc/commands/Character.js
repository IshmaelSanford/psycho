const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  WarnEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { getColorFromURL } = require("color-thief-node");
const jikanjs = require("jikanjs");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "character",
      enabled: true,
      syntax: "character <charactername>",
      about: "Display information about a given anime character",
    });
  }

  async execute(message, args) {
    if (args.length === 0) {
      return message.channel.send({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const query = args.join(" ");

    try {
      const searchResults = await jikanjs.search(query, "character");

      if (searchResults && searchResults.results.length > 0) {
        const character = searchResults.results[0];
        let color;
        try {
          color = await getColorFromURL(character.image_url);
        } catch (err) {
          console.error(`Error while processing image: ${err.message}`);
          color = "#23272A"; // Discord default color or any other fallback color
        }

        const characterEmbed = new DefaultEmbed({ title: character.name }, message)
          .setColor(color)
          .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setThumbnail(character.image_url)
          .addField("**Favorites**", character.favorites.toString(), true)
          .addField("**URL**", `[click here](${character.url})`, true);

        message.channel.send({ embeds: [characterEmbed] });
      } else {
        message.channel.send({
          embeds: [new ErrorEmbed({ description: "No character found" }, message)],
        });
      }
    } catch (error) {
      console.error(error);
      message.channel.send({
        embeds: [new WarnEmbed({ description: "Error **418**; fetching character information" }, message)],
      });
    }
  }
}