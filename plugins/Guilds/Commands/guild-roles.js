const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const {
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "guild-roles",
      enabled: true,
      syntax:
        "guild-roles <add OR remove OR list OR adduser OR removeuser OR listuser>",
    });
  }
  async execute(message, args) {
    const guild = this.client.plugins.guilds.userGuild(
      message.guild.id,
      message.author.id
    );

    if (!guild) {
      return message.reply({
        embeds: [new ErrorEmbed({ description: "You are not in a guild!" })],
      });
    }

    const hasPermissions = guild.members.some(
      (r) =>
        r.id === message.author.id && (r.rank === "owner" || r.rank === "admin")
    );

    if (!hasPermissions) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You can't manage roles!",
          }),
        ],
      });
    }

    const subcommand = args[0];

    if (!subcommand) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    const roleLimit = 10; //Math.floor(guild.members.length / 20);

    if (subcommand === "add") {
      if (guild.roles.length >= roleLimit) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `You can't have more than ${roleLimit} roles!`,
            }),
          ],
        });
      }

      const roleName = args.slice(1).join(" ");

      if (!roleName) {
        return message.reply({
          embeds: [new WrongSyntaxEmbed(this.name, "guild-roles add <name>")],
        });
      }

      const role = guild.roles.find((r) => r === roleName);

      if (role) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This role already exists!",
            }),
          ],
        });
      }

      guild.roles.push(roleName);

      this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

      message.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully added role \`${roleName}\`!`,
          }),
        ],
      });
    } else if (subcommand === "remove") {
      const roleName = args.slice(1).join(" ");

      if (!roleName) {
        return message.reply({
          embeds: [
            new WrongSyntaxEmbed(this.name, "guild-roles remove <name>"),
          ],
        });
      }

      const role = guild.roles.find((r) => r === roleName);

      if (!role) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This role doesn't exist!",
            }),
          ],
        });
      }

      guild.roles = guild.roles.filter((r) => r !== roleName);

      guild.members.forEach((member) => {
        member.roles = member.roles.filter((r) => r !== roleName);
      });

      this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

      message.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully removed role \`${roleName}\`!`,
          }),
        ],
      });
    } else if (subcommand === "list") {
      const embed = new DefaultEmbed({
        title: "Guild Roles",
        description: guild.roles.map((r) => r).join("\n"),
      });

      message.reply({ embeds: [embed] });
    } else if (subcommand === "adduser") {
      const user = message.mentions.users.first();
      const roleName = args.slice(2).join(" ");

      if (!user) {
        return message.reply({
          embeds: [
            new WrongSyntaxEmbed(
              this.name,
              "guild-roles adduser <user> <name>"
            ),
          ],
        });
      }

      const role = guild.roles.find((r) => r === roleName);

      if (!role) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This role doesn't exist!",
            }),
          ],
        });
      }

      const member = guild.members.find((r) => r.id === user.id);

      if (!member) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This user is not in your guild!",
            }),
          ],
        });
      }

      if (member.roles.includes(roleName)) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This user already has this role!",
            }),
          ],
        });
      }

      member.roles.push(roleName);

      this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

      message.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully added role \`${roleName}\` to ${user}!`,
          }),
        ],
      });
    } else if (subcommand === "removeuser") {
      const user = message.mentions.users.first();
      const roleName = args.slice(2).join(" ");

      if (!user) {
        return message.reply({
          embeds: [
            new WrongSyntaxEmbed(
              this.name,
              "guild-roles removeuser <user> <name>"
            ),
          ],
        });
      }

      const role = guild.roles.find((r) => r === roleName);

      if (!role) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This role doesn't exist!",
            }),
          ],
        });
      }

      const member = guild.members.find((r) => r.id === user.id);

      if (!member) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This user is not in your guild!",
            }),
          ],
        });
      }

      if (!member.roles.includes(roleName)) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "You don't have this role!",
            }),
          ],
        });
      }

      member.roles = member.roles.filter((r) => r !== roleName);

      this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

      message.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully removed role \`${roleName}\` from ${user}!`,
          }),
        ],
      });
    } else if (subcommand === "listuser") {
      const user = message.mentions.users.first();

      if (!user) {
        return message.reply({
          embeds: [
            new WrongSyntaxEmbed(this.name, "guild-roles listuser <user>"),
          ],
        });
      }

      const member = guild.members.find((r) => r.id === user.id);

      if (!member) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This user isn't in your guild!",
            }),
          ],
        });
      }

      const embed = new DefaultEmbed({
        title: `${user.username}'s Guild Roles`,
        description: member.roles.join("\n") || "No roles",
      });

      message.reply({ embeds: [embed] });
    }
  }
};
