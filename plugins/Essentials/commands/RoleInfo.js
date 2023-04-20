const { Command } = require("../../../structures");
const { DefaultEmbed, WarnEmbed, ErrorEmbed } = require("../../../embeds");
const { Permissions } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "roleinfo",
      aliases: ["ri"],
      enabled: true,
      syntax: "roleinfo <role_name/role_id/role_mention> [--list]",
      about: "Display information about a specific role",
    });
  }

  async execute(message, args) {
    if (args.length < 1) {
      return message.channel.send({ embeds: [new ErrorEmbed({ description: "No role provided" }, message)] });
    }

    const listFlag = args.includes("--list");
    if (listFlag) args = args.filter(arg => arg !== "--list");

    const input = args.join(" ");
    const role = message.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === input.toLowerCase() || r.id === input || r.toString() === input
    );

    if (!role) {
      return message.channel.send({ embeds: [new ErrorEmbed({ description: "Role not found. Provide name, id, or mention" }, message)] });
    }

    const membersWithRole = message.guild.members.cache.filter((member) => member.roles.cache.has(role.id));
    const memberCount = membersWithRole.size;

    const embed = new DefaultEmbed()
      .setTitle(role.name)
      .setColor(role.hexColor)
      .setDescription(`Role created on <t:${Math.floor(role.createdTimestamp / 1000)}:D> (<t:${Math.floor(role.createdTimestamp / 1000)}:R>)`)
      .addFields(
        { name: "**Role ID**", value: role.id, inline: true },
        { name: "**Color**", value: role.hexColor, inline: true },
        { name: "**Position**", value: `${role.position}`, inline: true },
        { name: "**Members**", value: `${memberCount}`, inline: true },
        { name: "**Hoist**", value: role.hoist ? "Yes" : "No", inline: true },
        { name: "**Mentionable**", value: role.mentionable ? "Yes" : "No", inline: true },
      )
      .setTimestamp();

    if (!listFlag) {
      return message.channel.send({ embeds: [embed] });
    }

    const pages = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(memberCount / itemsPerPage);

    const createListEmbed = (page) => {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const membersList = membersWithRole.map(m => m.user).slice(start, end).join("\n") || "None";

      const listEmbed = new DefaultEmbed()
        .setTitle(`Members with ${role.name} role`)
        .setDescription(membersList)
        .setColor(role.hexColor)
        .setTimestamp()
        .setFooter({ text: `(Page ${page}/${totalPages})` })

      return listEmbed;
    };

    for (let i = 1; i <= totalPages; i++) {
      pages.push(createListEmbed(i));
    }

    const msg = await message.channel.send({ embeds: [pages[currentPage - 1]] });
    if (totalPages <= 1) return;

    await msg.react("⬅️");
    await msg.react("➡️");

    const filter = (reaction, user) => {
      return ["⬅️", "➡️"].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    const collector = msg.createReactionCollector({ filter, time: 60000 });

    collector.on("collect", async (reaction, user) => {
      await reaction.users.remove(user.id);

      if (reaction.emoji.name === "⬅️") {
        if (currentPage > 1) currentPage--;
      } else if (reaction.emoji.name === "➡️") {
        if (currentPage < totalPages) currentPage++;
      }

      const newEmbed = pages[currentPage - 1];
      await msg.edit({ embeds: [newEmbed] });
    });

    collector.on("end", () => {
      msg.reactions.removeAll().catch(() => {});
    });
  }
};