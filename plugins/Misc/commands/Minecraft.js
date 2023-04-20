const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WarnEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const { getColorFromURL } = require("color-thief-node");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "minecraft",
      enabled: true,
      syntax: "minecraft <username> --skin",
      about: "Display information about a minecraft account",
    });
  }

  async execute(message, args) {
    if (args.length < 1) {
      return message.channel.send(
        new WrongSyntaxEmbed(this.client, message, this)
      );
    }

    const username = args[0];

    try {
      const fetch = (await import("node-fetch")).default;
      const uuidResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
      if (!uuidResponse.ok) {
        return message.channel.send({ embeds: [new ErrorEmbed({ description: "Error **404**: account not found" }, message)] });
      }

      const uuidData = await uuidResponse.json();
      const uuid = uuidData.id;
      const name = uuidData.name;

      const skinURL = `https://mc-heads.net/body/${uuid}`;

      if (args[1] && args[1].toLowerCase() === "--skin") {
        return message.channel.send({ content: skinURL });
      }

      let color;
      try {
        color = await getColorFromURL(skinURL);
      } catch (err) {
        console.error(`Error while processing image: ${err.message}`);
        color = "#23272A"; // Discord default color or any other fallback color
      }

      let embed = new DefaultEmbed()
        .setColor(color)
        .setAuthor({
          name: `${name}`,
          iconURL: `https://mc-heads.net/avatar/${uuid}/100`,
        })
        .setTitle(`${name}'s account`)
        .setDescription(`\`${uuid}\``)
        .addFields(
          { name: "**Info**", value: `**Name**: ${name}`, inline: true },
          { name: "**Skin**", value: `[Download Skin](https://mc-heads.net/download/${uuid})`, inline: true },
        )
        .setFooter({ text: `Powered by Mojang`, iconURL: "https://static-cdn.jtvnw.net/jtv_user_pictures/mojang-profile_image-27e2ee18448c1a27-300x300.png" })
        .setThumbnail(skinURL);

      message.channel.send({ embeds: [embed] });
          
    } catch (error) {
      console.error(error);
      return message.channel.send({ embeds: [new WarnEmbed({ description: "Error **404**: fetching profile information" }, message)] });
    }
  }
};