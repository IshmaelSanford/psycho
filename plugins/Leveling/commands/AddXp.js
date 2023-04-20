const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "addxp",
      enabled: true,
      aliases: ['addexp', 'axp'],
      syntax: "addxp <@user> <xp>",
      about: "Add XP to a user in the server",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first();
    const xpToAdd = parseInt(args[1]);

    if (!user || isNaN(xpToAdd)) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `That looks wrong. Try \`addxp (@user) (xp)\``,
          }, message),
        ],
      });
    }

    const guild = message.guild;
    const member = await message.guild.members.fetch(user.id); // Fetch the member instead of using cache

    // Get the current XP and level of the user
    const currentXP = await this.client.plugins.leveling.getXP(guild, member);
    const currentLevel = await this.client.plugins.leveling.getLevel(guild, member);

    // Add the specified XP to the user's current XP
    const newXP = currentXP + xpToAdd;

    // Update the user's XP
    await this.client.plugins.leveling.setXP(guild, member, newXP);

    const embed = new SuccessEmbed({
      description: `Successfully added **${xpToAdd}** XP to ${user}.`,
    }, message);

    await message.reply({ embeds: [embed] });
  }
};