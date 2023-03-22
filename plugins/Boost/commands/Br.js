const { Command } = require("../../../structures");
const {
  DefaultEmbed,
  ErrorEmbed,
  WrongSyntaxEmbed,
  SuccessEmbed,
} = require("../../../embeds");
const colorNamer = require("color-namer");
const { resolveColor } = require("discord.js");
const axios = require("axios");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "br",
      enabled: true,
      aliases: ["br"],
      syntax: "br [name] [hex] [icon]",
      about: "Setup your custom boost role",
      example: "br hex #ffffff",
    });
  }

  async execute(message, args) {

    async function getBoosterRole(client, member) {
      const roleId = client.plugins.boost.getRole(member);
      const role = await message.guild.roles.fetch(roleId);
      return role;
    }
  
    if (args.length === 0) {
      let role = await getBoosterRole(this.client, message.member);

  
      if (!role)
        return message.channel.send({
          embeds: [
            new ErrorEmbed({
              description: `You haven't boosted this server`,
            },message),
          ],
        });
  
      const nameEmbed = new DefaultEmbed()
        .setDescription(`🎨 ${message.author.toString()}: What would you like to name your role?`)
        .setColor("#d99e82");
  
      message.channel.send({ embeds: [nameEmbed] });
  
      const nameFilter = (m) => m.author.id === message.author.id;
      message.channel.awaitMessages({ filter: nameFilter, max: 1, time: 60000, errors: ['time'] })
        .then(async (collected) => {
          const roleName = collected.first().content;

          if (roleName.length > 25) {
            return message.channel.send({
              embeds: [
                new ErrorEmbed({
                  description: `Name too long, try something shorter`,
                },message),
              ],
            });
          }
  
          await role.edit({ name: roleName });
  
          const successNameEmbed = new SuccessEmbed({
            description: `What color would you like **${roleName}** to be?`,
          },message);
  
          message.channel.send({ embeds: [successNameEmbed] });
  
          const colorFilter = (m) => m.author.id === message.author.id;
          message.channel.awaitMessages({ filter: colorFilter, max: 1 })
            .then(async (collected) => {
              const hexColor = collected.first().content;
  
              if (!/^#[0-9A-F]{6}$/i.test(hexColor)) {
                return message.channel.send({
                  embeds: [
                    new ErrorEmbed({
                      description: `Please provide a [#hex-color](https://htmlcolorcodes.com/color-picker/)`,
                    },message),
                  ],
                });
              }
              else {
                const color = resolveColor(hexColor);
  
                await role.edit({ color: color });
              }
  
              if (message.guild.premiumTier < 2) {
                const successColorEmbed = new SuccessEmbed({
                  description: `Role **${roleName}** set with color \`${role.hexColor}\``,
                },message);
                return message.channel.send({ embeds: [successColorEmbed] });
              }
  
              const iconEmbed = new SuccessEmbed({
                description: `Color set to \`${role.hexColor}\` What emoji would you like the icon to be?`,
              },message);
  
              message.channel.send({ embeds: [iconEmbed] });
  
              const emojiFilter = (m) => m.author.id === message.author.id && m.content.match(/<:.+?:\d+>/g);
              message.channel.awaitMessages({ filter: emojiFilter, max: 1 })
                .then(async (collected) => {
                  const emoji = collected.first().content;

                  let id;

                  if (emoji.startsWith("<") && emoji.endsWith(">")) {
                    id = emoji.match(/\d{15,}/g)[0];

                    const type = await axios
                      .get(`https://cdn.discordapp.com/emojis/${id}.gif `)
                      .then((image) => {
                        if (image) return "gif";
                        else return "png";
                      })
                      .catch((error) => {
                        return "png";
                      });

                    const iconURL = `https://cdn.discordapp.com/emojis/${id}.${type}`;

                    try {
                      await role.edit({ icon: iconURL });
                    } catch (error) {
                      return message.reply({
                        embeds: [
                          new ErrorEmbed({ description: `${getErrorMessage(error)}` },message),
                        ],
                      });
                    }
                  } else {
                    return message.reply({
                      embeds: [
                        new ErrorEmbed({ description: `Invalid emoji provided.` },message),
                      ],
                    });
                  }
                  
                  const setupCompleteEmbed = new SuccessEmbed({
                    description: `Boost role all set up!`,
                  },message);
                  message.channel.send({ embeds: [setupCompleteEmbed] });
                })
                .catch(() => {
                  message.channel.send({
                    embeds: [
                      new ErrorEmbed({
                        description: `Ran out of time. Please try again`,
                      },message),
                    ],
                  });
                });
            })
        })
      return;
    }


    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    if (args.length === 3 && hexColorRegex.test(args[1]) && args[2].startsWith(':') && args[2].endsWith(':')) {
      const roleName = args[0];
      const hexColor = args[1];
      const emoji = args[2];
    
      if (roleName.length > 25) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `Name too long, try something shorter`,
            },message),
          ],
        });
      }
    
      if (!/^#[0-9A-F]{6}$/i.test(hexColor)) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `Invalid hex color provided.`,
            },message),
          ],
        });
      }
    
      let role = await getBoosterRole(this.client, message.member);
    
      if (!role)
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `You haven't boosted this server`,
            },message),
          ],
        });
  
      if (message.guild.premiumTier < 2)
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `This server hasn't unlocked role emojis yet (Boost Level 2 required).`,
            },message),
          ],
        });
    
      // Set the name and color of the role
      const color = resolveColor(hexColor);
      await role.edit({ name: roleName, color: color });
    
      // Set the icon of the role
      let id;
      if (emoji.startsWith("<") && emoji.endsWith(">")) {
        id = emoji.match(/\d{15,}/g)[0];
    
        const type = await axios
          .get(`https://cdn.discordapp.com/emojis/${id}.gif`)
          .then((image) => {
            if (image) return "gif";
            else return "png";
          })
          .catch((error) => {
            return "png";
          });
    
        const iconURL = `https://cdn.discordapp.com/emojis/${id}.${type}`;
    
        try {
          await role.edit({ icon: iconURL });
        } catch (error) {
          return message.reply({
            embeds: [
              new ErrorEmbed({ description: `${getErrorMessage(error)}` },message),
            ],
          });
        }
      } else {
        return message.reply({
          embeds: [
            new ErrorEmbed({ description: `Invalid emoji provided.` },message),
          ],
        });
      }
    
      const successEmbed = new SuccessEmbed({
        description: `Boost role successfully updated!`,
      },message);
    
      message.channel.send({ embeds: [successEmbed] });
    } else if (args[0] === "name") {
      //name subcommand goes here ---
      let role = await getBoosterRole(this.client, message.member);


      if (!role)
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `You haven't boosted this server`,
            },message),
          ],
        });

      const name = args.slice(1).join(" ");

      if (!name || name.length > 25)
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `**Name too long** try something shorter`,
            },message),
          ],
        });

      role.edit({ name });

      const embed = new SuccessEmbed({
        description: `Successfully set \`${name}\` for your booster role.`,
      },message);

      await message.reply({ embeds: [embed] });
    }

    if (args[0] === "hex") {
      let role = await getBoosterRole(this.client, message.member);


      if (!role)
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `You haven't boosted this server`,
            },message),
          ],
        });
        
      const hexColor = args[0];
      if (!/^#[0-9A-F]{6}$/i.test(hexColor)) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `Wrong notation. Try adding **#** or go [here](https://htmlcolorcodes.com/color-picker/) for help`,
            },message),
          ],
        });
      }

      const color = resolveColor(hexColor);
      const colorName = colorNamer(color).html[0].name;

      role = await role.edit({ color: color });

      const embed = new SuccessEmbed({
        description: `Set color **${colorName}** (\`${role.hexColor}\`) to your booster role`,
      },message);

      await message.reply({ embeds: [embed] });

    } else if (args[0] === "hex" && args.length === 2 && hexColorRegex.test(args[1])) {
      //hex subcommand goes here ---
      let role = await getBoosterRole(this.client, message.member);
    
      if (!role)
        return message.channel.send({
          embeds: [
            new ErrorEmbed({
              description: `You haven't boosted this server`,
            },message),
          ],
        });
    
        const inputColor = args.slice(1).join(" ");
    
      if (!this.constructor.isValidColor(inputColor)) {
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `Please provide a [#hex-color](https://htmlcolorcodes.com/color-picker/)`,
            },message),
          ],
        });
      }
    
      const color = resolveColor(inputColor);
    
      role = await role.edit({ color: color });

      const colorName = colorNamer(role.hexColor).html[0].name;

      const embed = new SuccessEmbed({
        description: `Set color **${colorName}** (\`${role.hexColor}\`) to your booster role`,
      },message);
    
      await message.reply({ embeds: [embed] });
    }else if (args[0] === "icon" && args.length === 2 && args[1].startsWith(':') && args[1].endsWith(':')) {
      //icon subcommand goes here ---
      let role = await getBoosterRole(this.client, message.member);

      if (!role)
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `You haven't boosted this server`,
            },message),
          ],
        });
    
      if (message.guild.premiumTier < 2)
        return message.reply({
          embeds: [
            new ErrorEmbed({
              description: `This server hasn't unlocked role emojis yet (Boost Level 2 required).`,
            },message),
          ],
        });
    
      let emoji = args[0]?.trim();
      let id;
    
      if (emoji?.startsWith("<") && emoji?.endsWith(">")) {
        id = emoji.match(/\d{15,}/g)[0];
    
        const type = await axios
          .get(`https://cdn.discordapp.com/emojis/${id}.gif `)
          .then((image) => {
            if (image) return "gif";
            else return "png";
          })
          .catch((error) => {
            return "png";
          });
    
        emoji = `https://cdn.discordapp.com/emojis/${id}.${type}`;
      } else if (emoji?.startsWith("http"))
        return message.reply({
          embeds: [
            new ErrorEmbed({ description: `You cannot add default emojis!` },message),
          ],
        });
      else
        return message.reply({
          embeds: [new WrongSyntaxEmbed(this.client, message, this)],
        });
    
      try {
        await role.edit({ icon: emoji });
      } catch (error) {
        return message.reply({
          embeds: [
            new ErrorEmbed({ description: `${error.message}` },message),
          ],
        });
      }
    
      const embed = new SuccessEmbed({
        description: `Successfully set icon for your booster role.`,
      },message);
    
      await message.reply({ embeds: [embed] });
  
    } else {
      return message.channel.send({
        embeds: [
          new ErrorEmbed({
            description: `Incorrect usage. Usage: br name-hex-icon <name> <hex> <icon>`,
          },message),
        ],
      });
    }
  }
};
