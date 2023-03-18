const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "about",
      enabled: true,
    });
  }
  async execute(message) {
    const embed = new DefaultEmbed()
      .setAuthor({
        name: this.client.user.username,
        iconURL: this.client.user.displayAvatarURL(),
      })
      .setTitle("About")
      .setDescription(
        `Psycho Syndicate was established in 2091 after the first galactic war. It is said that the organization was founded by a group of elite mercenaries and war veterans who had survived the devastating conflict. These individuals, disillusioned by the atrocities they witnessed and the political machinations that followed, decided to create a powerful, independent force that would operate beyond the jurisdiction of any government or faction.\n\nAs the organization expanded its operations, it became a force in the shadows, brokering deals, manipulating events, and even orchestrating government collapses. The Psycho Syndicate's motto, "In Psycho we trust," symbolized their willingness to destabilize the status quo for their goals.\n\nOperating as a complex network of autonomous cells, the organization's leadership remained a mystery, with only a select few knowing the true identity of the "Psycho Council." Despite authorities' efforts to dismantle it, the Psycho Syndicate continued to thrive, thanks to its vast resources, loyalty, and the expertise of its members.\n\nRumors of a new objective spread among the members, suggesting a plan to seize control of strategic points in the galaxy or even overthrow the galactic order. Though their true ambitions remain unknown, the Psycho Syndicate will continue to wield power as long as there is conflict and chaos in the universe.\n\n*or so they say...*`
      )
      .setImage(
        "https://cdn.discordapp.com/attachments/1072199749287022682/1085118134861705246/psycho-flag.jpg"
      )
      .setURL("https://www.youtube.com/watch?v=eBGIQ7ZuuiU")
      .setFooter({
        text: "We salute the psycho flag",
        iconURL: this.client.user.displayAvatarURL(),
      })
      .setTimestamp(new Date(Date.now() + 69 * 365 * 24 * 60 * 60 * 1000));

    await message.channel.send({ embeds: [embed] });
  }
};
