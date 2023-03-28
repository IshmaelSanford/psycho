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
        embeds: [new ErrorEmbed({ description: "You are not in a guild!" },message)],
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
          },message),
        ],
      });
    }

    const subcommand = args[0];

    if (!subcommand) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const roleLimit = 10; //Math.floor(guild.members.length / 20);

    if (subcommand === "add") {
      if (guild.roles.length >= roleLimit) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `You can't have more than ${roleLimit} roles!`,
            },message),
          ],
        });
      }

      const roleName = args.slice(1).join(" ");

      if (!roleName) {
        return message.reply({
          embeds: [new WrongSyntaxEmbed(this.client, message, this)],
        });
      }

      const role = guild.roles.find((r) => r === roleName);

      if (role) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This role already exists!",
            },message),
          ],
        });
      }

      guild.roles.push(roleName);

      this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

      message.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully added role \`${roleName}\`!`,
          },message),
        ],
      });
    } else if (subcommand === "remove") {
      const roleName = args.slice(1).join(" ");

      if (!roleName) {
        return message.reply({
          embeds: [new WrongSyntaxEmbed(this.client, message, this)],
        });
      }

      const role = guild.roles.find((r) => r === roleName);

      if (!role) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This role doesn't exist!",
            },message),
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
          },message),
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
          embeds: [new WrongSyntaxEmbed(this.client, message, this)],
        });
      }

      const role = guild.roles.find((r) => r === roleName);

      if (!role) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This role doesn't exist!",
            },message),
          ],
        });
      }

      const member = guild.members.find((r) => r.id === user.id);

      if (!member) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This user is not in your guild!",
            },message),
          ],
        });
      }

      if (member.roles.includes(roleName)) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This user already has this role!",
            },message),
          ],
        });
      }

      member.roles.push(roleName);

      this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

      message.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully added role \`${roleName}\` to ${user}!`,
          },message),
        ],
      });
    } else if (subcommand === "removeuser") {
      const user = message.mentions.users.first();
      const roleName = args.slice(2).join(" ");

      if (!user) {
        return message.reply({
          embeds: [new WrongSyntaxEmbed(this.client, message, this)],
        });
      }

      const role = guild.roles.find((r) => r === roleName);

      if (!role) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This role doesn't exist!",
            },message),
          ],
        });
      }

      const member = guild.members.find((r) => r.id === user.id);

      if (!member) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This user is not in your guild!",
            },message),
          ],
        });
      }

      if (!member.roles.includes(roleName)) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "You don't have this role!",
            },message),
          ],
        });
      }

      member.roles = member.roles.filter((r) => r !== roleName);

      this.client.plugins.guilds.set(message.guild.id, guild.id, guild);

      message.reply({
        embeds: [
          new SuccessEmbed({
            description: `Successfully removed role \`${roleName}\` from ${user}!`,
          },message),
        ],
      });
    } else if (subcommand === "listuser") {
      const user = message.mentions.users.first();

      if (!user) {
        return message.reply({
          embeds: [new WrongSyntaxEmbed(this.client, message, this)],
        });
      }

      const member = guild.members.find((r) => r.id === user.id);

      if (!member) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: "This user isn't in your guild!",
            },message),
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
