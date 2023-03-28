const { Command } = require("../../../structures");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setlevel",
      enabled: true,
      aliases: ['setlvl', 'slvl', 'sl'],
      syntax: "setlvl <@user> <level>",
      about: "Set a users level in the server",
      staffOnly: true,
    });
  }
  async execute(message, args) {
    const user = message.mentions.users.first();
    const level = parseInt(args[1]);
  
    if (!user || !level) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: `That looks wrong. Try \`setlevel (@user) (level)\``,
          }, message),
        ],
      });
    }
  
    const guild = message.guild;
    const member = await message.guild.members.fetch(user.id); // Fetch the member instead of using cache
  
    // Calculate the target XP based on the target level
    const adjustedLevel = level - 1;
    const targetXP = 5 * (adjustedLevel ** 2) + 50 * adjustedLevel + 100 + 1;
  
    await this.client.plugins.leveling.setLevelAndXP(guild, member, level, targetXP); // Set level and XP directly using setLevelAndXP
  
    const embed = new SuccessEmbed({
      description: `Successfully set ${user}'s level to **${level}**.`,
    }, message);
  
    await message.reply({ embeds: [embed] });
  }
};
