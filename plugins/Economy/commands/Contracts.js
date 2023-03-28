const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { ErrorEmbed, SuccessEmbed, DefaultEmbed } = require("../../../embeds");
const { CommandInteraction } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "contracts",
      enabled: true,
      syntax: "contracts [page]",
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
            description: "You must be in the mafia to view contracts!",
          },message),
        ],
      });
    }

    const contracts = this.client.plugins.economy.getContracts(
      message.guild.id
    );

    const maxPage = Math.ceil(contracts.length / 10);
    const page = Math.max(1, Math.min(maxPage, parseInt(args[0]) || 1));

    if (!contracts.length) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `There are no contracts in this server.`,
          },message),
        ],
      });
    }

    const embed = new DefaultEmbed().setTitle("Contracts").setFooter({
      text: `Page ${page} of ${maxPage}`,
    });

    for (const contract of contracts.slice((page - 1) * 10, page * 10)) {
      const target = await this.client.users.fetch(contract.target);
      embed.addFields({
        name: `Target: ${target.tag}`,
        value: `**Bounty:** $${this.client.plugins.economy.parseAmount(
          contract.bounty
        )}\n**Description:** ${contract.description}`,
      });
    }

    message.reply({ embeds: [embed] });
  }
};
