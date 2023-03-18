const { Command } = require("../../../structures");
const {
  DefaultEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  SuccessEmbed,
} = require("../../../embeds");
const Enmap = require("enmap");
const crypto = require("crypto");
const ms = require("ms");

const reminders = new Enmap({ name: "reminders" });

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "remind",
      enabled: true,
      aliases: ["rem"],
      syntax: "rem <duration(s,m,h)> <message>",
      about: "Get reminders from the bot",
      example: "remind 2h finish my homework",
    });
  }
  async execute(message, args) {
    if (args[0] === "list" || args[0] === "l") {
      const userReminders = reminders.get(message.author.id) || [];

      if (userReminders.length === 0) {
        return message.reply("You have no active reminders.");
      }

      const embed = new DefaultEmbed()
        .setAuthor({
          name: `${this.client.user.username} Reminders`,
          iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle("Your Active Reminders")
        .setDescription(
          userReminders
            .filter(reminder => reminder.endTime - Date.now() > 0)
            .map(
              (reminder, index) => {
                const timeDiff = reminder.endTime - Date.now();
                return `**#${index + 1}** - \`${reminder.text}\` in ${timeDiff > 0 ? ms(timeDiff, { long: true }) : 'Expired'}`;
              }
            )
            .join("\n")
        )

      return message.reply({ embeds: [embed] });
    }

    if (args.length === 0) {
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });
    }

    const durationArg = args[0];
    const duration = ms(durationArg);

    if (!duration) {
      return message.reply({
        embeds: [
          new ErrorEmbed({
            description:
              `${message.author.toString()}: Invalid time format. Format Example: **10m, 1h, 3h**..`,
          }),
        ],
      });
    }


    const reminderText = args.slice(1).join(" ");

    if (!reminderText)
      return message.reply({
        embeds: [new WrongSyntaxEmbed(this.client, message, this)],
      });

    await message.channel.send({
      embeds: [
        new SuccessEmbed({
          description: `${message.author.toString()}: Set reminder in **${ms(duration, {
            long: true,
          })}** for \`${reminderText}\`.`,
        }),
      ],
    });

    const endTime = Date.now() + duration;
    const reminderId = crypto.randomBytes(16).toString("hex");

    const userReminders = reminders.get(message.author.id) || [];
    userReminders.push({
      id: reminderId,
      text: reminderText,
      endTime,
    });
    reminders.set(message.author.id, userReminders);

    setTimeout(() => {
      message.author
        .send({
          embeds: [
            new DefaultEmbed()
              .setAuthor({
                name: `${this.client.user.username} reminders`,
                iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
              })
              .setTitle("`⏰` *forgetting something...*")
              .setDescription(
                `Hey ${message.author.username}! \nDon't forget to \`${reminderText}\``
              )
              .addFields(
                {
                  name: "Reminder Duration",
                  value: `\`${ms(duration, { long: true })}\``,
                  inline: false,
                },
                {
                  name: "Command Sent At",
                  value: `<t:${Math.floor(
                    message.createdTimestamp / 1000
                  )}:F>`,
                  inline: false,
                }
              )
              .setTimestamp(),
          ],
        })
        .catch(() => {});

      // Delete the reminder from the Enmap
      const userReminders = reminders.get(message.author.id);
      const updatedReminders = userReminders.filter((r) => r.id !== reminderId);
      reminders.set(message.author.id, updatedReminders);
    }, duration);
  }
};

