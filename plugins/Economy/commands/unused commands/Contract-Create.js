const { Command } = require("../../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ErrorEmbed,
  SuccessEmbed,
  DefaultEmbed,
  WrongSyntaxEmbed,
} = require("../../../../embeds");
const { CommandInteraction } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "contract-create",
      enabled: false,
      syntax: "contract-create <user> <bounty> <description>",
    });
  }
  async execute(message, args) {
    const { stats } = this.client.plugins.economy.getData(
      message.guild.id,
      message.author.id
    );

    if (!stats.mafia) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You must be in a mafia to create a contract!",
          },message),
        ],
      });
    }

    if (stats.xp < 3000) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You must be Prestige Level 3 to create a contract!",
          },message),
        ],
      });
    }

    const user = message.mentions.users.first();
    const bounty = parseInt(args[1]);
    const description = args.slice(2).join(" ");

    if (!user || !bounty || !description) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    if (user.id === message.author.id) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You can't create a contract with yourself.",
          },message),
        ],
      });
    }

    if (bounty < 1000) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "The minimum bounty is 1,000. Please try again.",
          },message),
        ],
      });
    }

    if (stats.cash < bounty) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You don't have enough cash to create this contract.",
          },message),
        ],
      });
    }

    if (description.length > 255) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "The description must be less than 255 characters.",
          },message),
        ],
      });
    }

    const contract = {
      id: this.client.plugins.economy.contracts.autonum,
      target: user.id,
      bounty: bounty,
      description: description,
      user: message.author.id,
      guild: message.guild.id,
    };

    this.client.plugins.economy.addContract(message.guild.id, contract);

    message.reply({
      embeds: [
        new SuccessEmbed({
          description: `You have successfully created a contract for **${
            user.tag
          }** with a bounty of **$${this.client.plugins.economy.parseAmount(
            bounty
          )}**.`,
        },message),
      ],
    });
  }
};
