const { Command } = require("../../../structures");
const {
  SuccessEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  DefaultEmbed,
} = require("../../../embeds");
const ms = require("ms");
const { PermissionFlagsBits } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "heist",
      enabled: true,
      syntax: "heist <user> <start_time>",
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
            description: "You must be in the mafia to create a heist!",
          }),
        ],
      });
    }

    const user = message.mentions.users.first();
    const duration = ms(args[1] || "x");

    if (!user || !duration) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.name, this.syntax)],
      });
    }

    if (duration > ms("30m")) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "The heist start time must be less than 30 minutes!",
          }),
        ],
      });
    }

    if (
      this.client.plugins.economy.cooldown(
        message.guild.id,
        message.author.id,
        "heisted",
        1000 * 60 * 60 * 24
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description:
              "There was a heist on this person in the last 24 hours!",
          }),
        ],
      });
    }

    if (
      this.client.plugins.economy.cooldown(
        message.guild.id,
        message.author.id,
        "heist",
        1000 * 60 * 60
      )
    ) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description: "You must wait an hour before starting a heist again!",
          }),
        ],
      });
    }

    const users = [message.author.id];

    function embed() {
      return new DefaultEmbed({
        title: "Heist",
        description: `${message.author} is planning a heist on ${user}!`,
        fields: [
          {
            name: "Participants",
            value: users.map((u) => `<@${u}>`).join(" "),
          },
          {
            name: "Starts",
            value: `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`,
          },
        ],
      });
    }

    const msg = await message.channel.send({
      embeds: [embed()],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              label: "Join",
              custom_id: "join",
            },
          ],
        },
      ],
    });

    const filter = (interaction) => interaction.message.id === msg.id;

    const collector = msg.createMessageComponentCollector({
      filter,
      time: duration,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "join") {
        if (interaction.user.id === user.id) {
          return interaction.reply({
            embeds: [
              new ErrorEmbed({
                description: "You cannot join a heist on yourself!",
              }),
            ],
            ephemeral: true,
          });
        }
        if (users.includes(interaction.user.id)) {
          return interaction.reply({
            embeds: [
              new ErrorEmbed({
                description: "You are already in this heist!",
              }),
            ],
            ephemeral: true,
          });
        }

        users.push(interaction.user.id);

        await interaction.update({
          embeds: [embed()],
        });
      }
    });

    collector.on("end", async (collected) => {
      const successChance = Math.min(95, users.length * 5);
      const success = Math.floor(Math.random() * 100) < successChance;

      if (!success) {
        await msg.edit({
          embeds: [
            new ErrorEmbed({
              description: `The heist failed!\n\nYou stole nothing from ${user}!`,
            }),
          ],
          components: [],
        });
        return;
      }
      const userData = this.client.plugins.economy.getData(
        message.guild.id,
        user.id
      );
      const percentage = Math.random() * 0.1 + 0.8;
      const amount = Math.floor(userData.stats.cash * percentage);

      this.client.plugins.economy.removeFromBalance(
        message.guild.id,
        user.id,
        amount
      );

      const perUser = Math.floor(amount / users.length);

      for (const userId of users) {
        this.client.plugins.economy.addToBalance(
          message.guild.id,
          userId,
          perUser
        );
      }

      await msg.edit({
        embeds: [
          new SuccessEmbed({
            description: `The heist was a success!\n\nYou stole **$${this.client.plugins.economy.parseAmount(
              amount
            )}** from ${user}!\nEveryone got **$${this.client.plugins.economy.parseAmount(
              perUser
            )}**!`,
          }),
        ],
        components: [],
      });
    });
  }
};
