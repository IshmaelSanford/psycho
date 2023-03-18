const shuffle = require("shuffle-array");
const games = new Set();
const Discord = require("discord.js");

class Collect {
  async buttonCollect(message, userId, yourcard, dealercard, DECK, options) {
    let filter = async (i) => {
      await i.deferUpdate();
      return (
        [
          "discord-blackjack-hitbtn",
          "discord-blackjack-splitbtn",
          "discord-blackjack-standbtn",
          "discord-blackjack-ddownbtn",
          "discord-blackjack-cancelbtn",
          "discord-blackjack-insbtn",
          "discord-blackjack-noinsbtn",
        ].includes(i.customId) && i.user.id === userId
      );
    };
    let result = await message
      .awaitMessageComponent({ filter, time: 30000 })
      .then(async (i) => {
        switch (i.customId) {
          case "discord-blackjack-hitbtn": {
            return this.hit(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
          }
          case "discord-blackjack-splitbtn": {
            return this.split(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
          }
          case "discord-blackjack-standbtn": {
            return this.stand(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
          }
          case "discord-blackjack-ddownbtn": {
            return this.doubledown(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
          }
          case "discord-blackjack-cancelbtn": {
            return this.cancel(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
          }
          case "discord-blackjack-insbtn": {
            return this.insurance(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
          }
          case "discord-blackjack-noinsbtn": {
            return this.noinsurance(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
          }
        }
      })
      .catch((e) => {
        if (options.transition === "edit") {
          return {
            result: "TIMEOUT",
            method: "None",
            ycard: yourcard,
            dcard: dealercard,
            message: message,
          };
        } else if (options.transition === "delete") {
          message.delete();
          return {
            result: "TIMEOUT",
            method: "None",
            ycard: yourcard,
            dcard: dealercard,
          };
        }
      });

    return result;
  }

  async messageCollect(
    message,
    userId,
    yourcard,
    dealercard,
    DECK,
    options,
    filter1
  ) {
    if (!filter1) filter1 = ["h", "hit", "s", "stand", "cancel"];
    let filter = (i) =>
      filter1.includes(i.content.toLowerCase()) && i.author.id === userId;
    let result = await message.channel
      .awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] })
      .then(async (msg) => {
        msg = msg.first();
        if (!msg) {
          if (options.transition === "edit") {
            return {
              result: "TIMEOUT",
              method: "None",
              ycard: yourcard,
              dcard: dealercard,
              message: message,
            };
          } else if (options.transition === "delete") {
            message.delete();
            return {
              result: "TIMEOUT",
              method: "None",
              ycard: yourcard,
              dcard: dealercard,
            };
          }
        }
        if (msg.content.toLowerCase().startsWith("h")) {
          return this.hit(message, userId, yourcard, dealercard, DECK, options);
        } else if (
          msg.content.toLowerCase() === "split" &&
          filter1.includes("split")
        ) {
          return this.split(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          );
        } else if (
          msg.content.toLowerCase().startsWith("d") &&
          filter1.includes("d")
        ) {
          return this.doubledown(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          );
        } else if (msg.content.toLowerCase().startsWith("s")) {
          return this.stand(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          );
        } else if (msg.content.toLowerCase() === "cancel") {
          return this.cancel(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          );
        } else if (msg.content.toLowerCase() === "i") {
          return this.insurance(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          );
        } else if (msg.content.toLowerCase() === "ni") {
          return this.noinsurance(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          );
        }
      })
      .catch((e) => {
        if (options.transition === "edit") {
          return {
            result: "TIMEOUT",
            method: "None",
            ycard: yourcard,
            dcard: dealercard,
            message: message,
          };
        } else if (options.transition === "delete") {
          message.delete();
          return {
            result: "TIMEOUT",
            method: "None",
            ycard: yourcard,
            dcard: dealercard,
          };
        }
      });

    return result;
  }

  async hit(message, userId, yourcard, dealercard, DECK, options) {
    let gotCard = DECK.pop();
    let embed = options.embed;
    let isSoft = false;
    if (gotCard.rank === "A") {
      if (yourcard.map((c) => c.rank).includes("A")) {
        gotCard.value = 1;
      } else {
        gotCard.value = 11;
      }
    }

    yourcard.push(gotCard);

    if (
      yourcard.map((c) => c.rank).includes("A") &&
      yourcard.find((c) => c.rank === "A" && c.value === 11)
    ) {
      isSoft = true;
    }

    if (
      yourcard.map((c) => c.value).reduce((a, b) => b + a) > 21 &&
      isSoft == true
    ) {
      isSoft = false;
      for (let y = 0; y < yourcard.length; y++) {
        if (yourcard[y].rank === "A") {
          yourcard[y].value = 1;
        }
      }
    }

    if (yourcard.map((c) => c.value).reduce((a, b) => b + a) >= 21) {
      return this.stand(message, userId, yourcard, dealercard, DECK, options);
    }

    embed.fields[0].value = `Cards: ${yourcard
      .map((c) => `[\`${c.emoji} ${c.rank}\`](https://google.com)`)
      .join(" ")}\nTotal:${isSoft ? " Soft" : ""} ${yourcard
      .map((c) => c.value)
      .reduce((a, b) => b + a)}`;
    options.embed = embed;

    let components = message?.components || [];
    while (components.length == 2 && components[0].components.length > 2) {
      components[0].components.pop();
    }

    if (options.isSplit === "first" && options.secondHand) {
      embed.description = "This is the first hand.";
      let pv = yourcard.map((c) => c.value).reduce((a, b) => b + a);
      if ((pv === 9 || pv === 10 || pv === 11) && yourcard.length == 2) {
        let embed = options.embed;
        let hitbtn = {
          label: "Hit",
          style: 1,
          custom_id: "discord-blackjack-hitbtn",
          type: 2,
        };
        let standbtn = {
          label: "Stand",
          style: 1,
          custom_id: "discord-blackjack-standbtn",
          type: 2,
        };
        let ddownbtn = {
          label: "Double Down",
          style: 1,
          custom_id: "discord-blackjack-ddownbtn",
          type: 2,
        };
        let splitbtn = {
          label: "Split",
          style: 1,
          custom_id: "discord-blackjack-splitbtn",
          type: 2,
        };
        let cancelbtn = {
          label: "Cancel",
          style: 4,
          custom_id: "discord-blackjack-cancelbtn",
          type: 2,
        };
        let row1 = { type: 1, components: [hitbtn, standbtn, ddownbtn] };
        let row2 = { type: 1, components: [cancelbtn] };
        let components = [row1, row2];
        if (options.transition === "edit") {
          if (options.commandType === "message") {
            message = await message.edit({ embeds: [embed], components });
          } else {
            message = await message.edit({ embeds: [embed], components });
          }
        } else {
          if (options.commandType === "message") {
            await message.delete();
            message = await message.channel.send({
              embeds: [embed],
              components,
            });
          } else {
            if (!message.ephemeral) {
              await message.delete();
            }
            message = await message.channel.send({
              embeds: [embed],
              components,
            });
          }
        }
        return options.buttons
          ? this.buttonCollect(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            )
          : this.messageCollect(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
      }
    } else if (options.secondHand) {
      embed.description = "This is the second hand.";
      let pv2 = yourcard.map((c) => c.value).reduce((a, b) => b + a);
      if ((pv2 === 9 || pv2 === 10 || pv2 === 11) && yourcard.length == 2) {
        let embed = options.embed;
        let hitbtn = {
          label: "Hit",
          style: 1,
          custom_id: "discord-blackjack-hitbtn",
          type: 2,
        };
        let standbtn = {
          label: "Stand",
          style: 1,
          custom_id: "discord-blackjack-standbtn",
          type: 2,
        };
        let ddownbtn = {
          label: "Double Down",
          style: 1,
          custom_id: "discord-blackjack-ddownbtn",
          type: 2,
        };
        let splitbtn = {
          label: "Split",
          style: 1,
          custom_id: "discord-blackjack-splitbtn",
          type: 2,
        };
        let cancelbtn = {
          label: "Cancel",
          style: 4,
          custom_id: "discord-blackjack-cancelbtn",
          type: 2,
        };
        let row1 = { type: 1, components: [hitbtn, standbtn, ddownbtn] };
        let row2 = { type: 1, components: [cancelbtn] };
        let components = [row1, row2];
        if (options.transition === "edit") {
          if (options.commandType === "message") {
            message = await message.edit({ embeds: [embed], components });
          } else {
            message = await message.edit({ embeds: [embed], components });
          }
        } else {
          if (options.commandType === "message") {
            await message.delete();
            message = await message.channel.send({
              embeds: [embed],
              components,
            });
          } else {
            if (!message.ephemeral) {
              await message.delete();
            }
            message = await message.channel.send({
              embeds: [embed],
              components,
            });
          }
        }
        return options.buttons
          ? this.buttonCollect(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            )
          : this.messageCollect(
              message,
              userId,
              yourcard,
              dealercard,
              DECK,
              options
            );
      }
    } else {
      embed.description = embed.description;
    }
    if (options.transition === "edit") {
      if (options.commandType === "message") {
        message = await message.edit({ embeds: [embed], components });
      } else {
        message = await message.edit({ embeds: [embed], components });
      }
    } else {
      if (options.commandType === "message") {
        await message.delete();
        message = await message.channel.send({ embeds: [embed], components });
      } else {
        if (!message.ephemeral) {
          await message.delete();
        }
        message = await message.channel.send({ embeds: [embed], components });
      }
    }

    return options.buttons
      ? this.buttonCollect(message, userId, yourcard, dealercard, DECK, options)
      : this.messageCollect(
          message,
          userId,
          yourcard,
          dealercard,
          DECK,
          options
        );
  }

  async stand(message, userId, yourcard, dealercard, DECK, options) {
    let yourvalue = yourcard.map((c) => c.value).reduce((a, b) => b + a);
    let dealervalue = dealercard.map((d) => d.value).reduce((a, b) => b + a);
    let finalResult = {};
    let finalResult2 = {};

    if (options.isSplit === "first") {
      options.isSplit = "second";
      let dealerrank = [dealercard[0].rank, dealercard[1].rank];
      while (dealervalue < 17) {
        let newCard = DECK.pop();
        dealercard.push(newCard);
        dealerrank.push(newCard.rank);
        if (newCard.rank == "A") {
          if (dealerrank.includes("A")) {
            newCard.value = 1;
          } else {
            newCard.value = 11;
          }
        }
        dealervalue += newCard.value;
        if (dealervalue > 21 && dealerrank.includes("A")) {
          let unu = 0;
          dealercard.forEach((e) => {
            if (e.rank == "A") {
              dealercard[unu].value = 1;
              dealervalue = dealercard
                .map((d) => d.value)
                .reduce((a, b) => b + a);
            }
            unu++;
          });
        }
      }

      finalResult2 = await this.hit(
        message,
        userId,
        options.secondHand,
        dealercard,
        DECK,
        options
      );
      let yourvalue2 = finalResult2.ycard
        .map((c) => c.value)
        .reduce((a, b) => b + a);
      let yourcard2 = finalResult2.ycard;
      let bj1 = false;
      let bj2 = false;
      let dbj1 = false;
      let dbj2 = false;
      if (
        yourvalue === 21 &&
        yourcard.length === 2 &&
        ((dealervalue === 21 && dealercard.length != 2) || dealervalue != 21)
      ) {
        bj1 = true;
      }
      if (
        yourvalue2 === 21 &&
        yourcard2.length === 2 &&
        ((dealervalue === 21 && dealercard.length != 2) || dealervalue != 21)
      ) {
        bj2 = true;
      }
      if (
        dealervalue === 21 &&
        dealercard.length === 2 &&
        ((yourvalue === 21 && yourcard.length != 2) || yourvalue != 21)
      ) {
        dbj1 = true;
      }
      if (
        dealervalue === 21 &&
        dealercard.length === 2 &&
        ((yourvalue2 === 21 && yourcard2.length != 2) || yourvalue2 != 21)
      ) {
        dbj2 = true;
      }

      if (options.isDoubleDown !== true) {
        if (yourvalue > 21 && yourvalue2 > 21) {
          finalResult = {
            result: "SPLIT LOSE-LOSE",
            method: `1st Hand: You lost (busted).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && bj2 == true) {
          finalResult = {
            result: "SPLIT LOSE-BLACKJACK",
            method: `1st Hand: You lost (busted).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            ycard2: finalResult2.ycard,
            dcard: dealercard,
          };
        } else if (bj1 == true && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT BLACKJACK-LOSE`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (bj1 == true && bj2 == true) {
          finalResult = {
            result: `SPLIT BLACKJACK-BLACKJACK`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT LOSE-WIN`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT WIN-LOSE`,
            method: `1st Hand: You won with more points.\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT WIN-WIN`,
            method: `1st Hand: You won with more points.\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false
        ) {
          finalResult = {
            result: `SPLIT WIN-WIN`,
            method: `1st Hand: You won (dealer busted).\n2nd Hand: You won (dealer busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false
        ) {
          finalResult = {
            result: `SPLIT BLACKJACK-WIN`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You won (dealer busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT WIN-BLACKJACK`,
            method: `1st Hand: You won (dealer busted).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj1 == false
        ) {
          finalResult = {
            result: `SPLIT LOSE-WIN`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You won (dealer busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT WIN-LOSE`,
            method: `1st Hand: You won (dealer busted).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && dbj2 == true) {
          finalResult = {
            result: `SPLIT LOSE-LOSE`,
            method: `1st Hand: You lost (dealer had blackjack).\n2nd Hand: You lost (dealer had blackjack).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && dbj2 == true) {
          finalResult = {
            result: `SPLIT LOSE-LOSE`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You lost (dealer had blackjack).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT LOSE-LOSE`,
            method: `1st Hand: You lost (dealer had blackjack).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT LOSE-LOSE`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT WIN-LOSE`,
            method: `1st Hand: You won with more points.\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT LOSE-WIN`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT BLACKJACK-LOSE`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT LOSE-BLACKJACK`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT LOSE-LOSE`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT LOSE-LOSE`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT LOSE-TIE`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT TIE-LOSE`,
            method: `1st Hand: You tied.\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (bj1 == true && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT BLACKJACK-TIE`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && bj2 == true) {
          finalResult = {
            result: `SPLIT TIE-BLACKJACK`,
            method: `1st Hand: You tied.\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          dealervalue === yourvalue2
        ) {
          finalResult = {
            result: `SPLIT WIN-TIE`,
            method: `1st Hand: You won with more points.\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue === yourvalue &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT TIE-WIN`,
            method: `1st Hand: You tied.\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT LOSE-TIE`,
            method: `1st Hand: You lost (dealer had blackjack).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && dbj2 == true) {
          finalResult = {
            result: `SPLIT TIE-LOSE`,
            method: `1st Hand: You tied.\n2nd Hand: You lost (dealer had blackjack).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          dealervalue === yourvalue2
        ) {
          finalResult = {
            result: `SPLIT LOSE-TIE`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue === yourvalue &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT TIE-LOSE`,
            method: `1st Hand: You tied.\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT TIE-TIE`,
            method: `1st Hand: You tied.\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT WIN-WIN`,
            method: `1st Hand: You won with more points.\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT WIN-WIN`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        }
      } else if (
        options.isDoubleDown == true &&
        options.isFirstSplitDouble == true &&
        options.isSecondSplitDouble != true
      ) {
        if (yourvalue > 21 && yourvalue2 > 21) {
          finalResult = {
            result: "SPLIT DOUBLE LOSE-LOSE",
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && bj2 == true) {
          finalResult = {
            result: "SPLIT DOUBLE LOSE-BLACKJACK",
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            ycard2: finalResult2.ycard,
            dcard: dealercard,
          };
        } else if (bj1 == true && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-LOSE`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (bj1 == true && bj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-BLACKJACK`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-WIN`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-LOSE`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-WIN`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-WIN`,
            method: `1st Hand: You won (dealer busted) (double).\n2nd Hand: You won (dealer busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LACKJACK-WIN`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You won (dealer busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-BLACKJACK`,
            method: `1st Hand: You won (dealer busted) (double).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj1 == false
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-WIN`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You won (dealer busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-LOSE`,
            method: `1st Hand: You won (dealer busted) (double).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && dbj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-LOSE`,
            method: `1st Hand: You lost (dealer had blackjack) (double).\n2nd Hand: You lost (dealer had blackjack).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && dbj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-LOSE`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You lost (dealer had blackjack).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-LOSE`,
            method: `1st Hand: You lost (dealer had blackjack) (double).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-LOSE`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-LOSE`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-WIN`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-LOSE`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-BLACKJACK`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-LOSE`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-LOSE`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-TIE`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-LOSE`,
            method: `1st Hand: You tied (double).\n2nd Hand: You lost (busted).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (bj1 == true && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-TIE`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && bj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-BLACKJACK`,
            method: `1st Hand: You tied (double).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          dealervalue === yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-TIE`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue === yourvalue &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-WIN`,
            method: `1st Hand: You tied (double).\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-TIE`,
            method: `1st Hand: You lost (dealer had blackjack) (double).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && dbj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-LOSE`,
            method: `1st Hand: You tied (double).\n2nd Hand: You lost (dealer had blackjack).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          dealervalue === yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-TIE`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue === yourvalue &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-LOSE`,
            method: `1st Hand: You tied (double).\n2nd Hand: You lost (dealer had more points).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-TIE`,
            method: `1st Hand: You tied (double).\n2nd Hand: You tied.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-WIN`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You won with blackjack.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-WIN`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You won with more points.`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        }
      } else if (
        options.isDoubleDown == true &&
        options.isFirstSplitDouble != true &&
        options.isSecondSplitDouble == true
      ) {
        if (yourvalue > 21 && yourvalue2 > 21) {
          finalResult = {
            result: "SPLIT LOSE-DOUBLE LOSE",
            method: `1st Hand: You lost (busted).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && bj2 == true) {
          finalResult = {
            result: "SPLIT LOSE-DOUBLE BLACKJACK",
            method: `1st Hand: You lost (busted).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            ycard2: finalResult2.ycard,
            dcard: dealercard,
          };
        } else if (bj1 == true && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT BLACKJACK-DOUBLE LOSE`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (bj1 == true && bj2 == true) {
          finalResult = {
            result: `SPLIT BLACKJACK-DOUBLE BLACKJACK`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE WIN`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE LOSE`,
            method: `1st Hand: You won with more points.\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE WIN`,
            method: `1st Hand: You won with more points.\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE WIN`,
            method: `1st Hand: You won (dealer busted).\n2nd Hand: You won (dealer busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false
        ) {
          finalResult = {
            result: `SPLIT BLACKJACK-DOUBLE WIN`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You won (dealer busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE BLACKJACK`,
            method: `1st Hand: You won (dealer busted).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj1 == false
        ) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE WIN`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You won (dealer busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE LOSE`,
            method: `1st Hand: You won (dealer busted).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && dbj2 == true) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (dealer had blackjack).\n2nd Hand: You lost (dealer had blackjack) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && dbj2 == true) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You lost (dealer had blackjack) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (dealer had blackjack).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE LOSE`,
            method: `1st Hand: You won with more points.\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE WIN`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT BLACKJACK-DOUBLE LOSE`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE BLACKJACK`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE TIE`,
            method: `1st Hand: You lost (busted).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT TIE-DOUBLE LOSE`,
            method: `1st Hand: You tied.\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (bj1 == true && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT BLACKJACK-DOUBLE TIE`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && bj2 == true) {
          finalResult = {
            result: `SPLIT TIE-DOUBLE BLACKJACK`,
            method: `1st Hand: You tied.\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          dealervalue === yourvalue2
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE TIE`,
            method: `1st Hand: You won with more points.\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue === yourvalue &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT TIE-DOUBLE WIN`,
            method: `1st Hand: You tied.\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE TIE`,
            method: `1st Hand: You lost (dealer had blackjack).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && dbj2 == true) {
          finalResult = {
            result: `SPLIT TIE-DOUBLE LOSE`,
            method: `1st Hand: You tied.\n2nd Hand: You lost (dealer had blackjack) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          dealervalue === yourvalue2
        ) {
          finalResult = {
            result: `SPLIT LOSE-DOUBLE TIE`,
            method: `1st Hand: You lost (dealer had more points).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue === yourvalue &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT TIE-DOUBLE LOSE`,
            method: `1st Hand: You tied.\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT TIE-DOUBLE TIE`,
            method: `1st Hand: You tied.\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE WIN`,
            method: `1st Hand: You won with more points.\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT WIN-DOUBLE WIN`,
            method: `1st Hand: You won with blackjack.\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        }
      } else if (
        options.isDoubleDown == true &&
        options.isFirstSplitDouble == true &&
        options.isSecondSplitDouble == true
      ) {
        if (yourvalue > 21 && yourvalue2 > 21) {
          finalResult = {
            result: "SPLIT DOUBLE LOSE-DOUBLE LOSE",
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && bj2 == true) {
          finalResult = {
            result: "SPLIT DOUBLE LOSE-DOUBLE BLACKJACK",
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            ycard2: finalResult2.ycard,
            dcard: dealercard,
          };
        } else if (bj1 == true && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-DOUBLE LOSE`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (bj1 == true && bj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-DOUBLE BLACKJACK`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE WIN`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE LOSE`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE WIN`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE WIN`,
            method: `1st Hand: You won (dealer busted) (double).\n2nd Hand: You won (dealer busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj2 == false
        ) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-DOUBLE WIN`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You won (dealer busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE BLACKJACK`,
            method: `1st Hand: You won (dealer busted) (double).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          dealervalue > yourvalue2 &&
          dealervalue > 21 &&
          yourvalue2 <= 21 &&
          bj1 == false
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE WIN`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You won (dealer busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue <= 21 &&
          bj1 == false &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE LOSE`,
            method: `1st Hand: You won (dealer busted) (double).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && dbj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (dealer had blackjack) (double).\n2nd Hand: You lost (dealer had blackjack) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && dbj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You lost (dealer had blackjack) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (dealer had blackjack) (double).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE LOSE`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE WIN`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-DOUBLE LOSE`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE BLACKJACK`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue > 21 &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          yourvalue2 > 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE LOSE`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (yourvalue > 21 && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE TIE`,
            method: `1st Hand: You lost (busted) (double).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && yourvalue2 > 21) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-DOUBLE LOSE`,
            method: `1st Hand: You tied (double).\n2nd Hand: You lost (busted) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (bj1 == true && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT DOUBLE BLACKJACK-DOUBLE TIE`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && bj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-DOUBLE BLACKJACK`,
            method: `1st Hand: You tied (double).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          dealervalue === yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE TIE`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue === yourvalue &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-DOUBLE WIN`,
            method: `1st Hand: You tied (double).\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dbj1 == true && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE TIE`,
            method: `1st Hand: You lost (dealer had blackjack) (double).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && dbj2 == true) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-DOUBLE LOSE`,
            method: `1st Hand: You tied (double).\n2nd Hand: You lost (dealer had blackjack) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue <= 21 &&
          dealervalue === yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE LOSE-DOUBLE TIE`,
            method: `1st Hand: You lost (dealer had more points) (double).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          dealervalue === yourvalue &&
          dealervalue > yourvalue2 &&
          dealervalue <= 21
        ) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-DOUBLE LOSE`,
            method: `1st Hand: You tied (double).\n2nd Hand: You lost (dealer had more points) (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue && dealervalue === yourvalue2) {
          finalResult = {
            result: `SPLIT DOUBLE TIE-DOUBLE TIE`,
            method: `1st Hand: You tied (double).\n2nd Hand: You tied (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          yourvalue <= 21 &&
          bj1 == false &&
          dealervalue < yourvalue &&
          bj2 == true
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE WIN`,
            method: `1st Hand: You won with more points (double).\n2nd Hand: You won with blackjack (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        } else if (
          bj1 == true &&
          yourvalue2 <= 21 &&
          bj2 == false &&
          dealervalue < yourvalue2
        ) {
          finalResult = {
            result: `SPLIT DOUBLE WIN-DOUBLE WIN`,
            method: `1st Hand: You won with blackjack (double).\n2nd Hand: You won with more points (double).`,
            ycard: yourcard,
            ycard2: yourcard2,
            dcard: dealercard,
          };
        }
      }

      return finalResult;
    }

    if (options.isSplit === "second") {
      options.isSplit = "done";
      if (options.isDoubleDown !== true) {
        if (yourvalue > 21) {
          finalResult2 = {
            result: "LOSE",
            method: "You busted",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (yourvalue === 21) {
          finalResult2 = {
            result: "WIN",
            method: "You had blackjack",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (yourvalue < 21 && dealervalue < yourvalue) {
          finalResult2 = {
            result: "WIN",
            method: "You had more",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue < 21
        ) {
          finalResult2 = {
            result: "WIN",
            method: "Dealer busted",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (dealervalue === 21 && yourvalue < 21) {
          finalResult2 = {
            result: "LOSE",
            method: "Dealer had blackjack",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (dealervalue > yourvalue && dealervalue < 21) {
          finalResult2 = {
            result: "LOSE",
            method: "Dealer had more",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue) {
          finalResult2 = {
            result: "TIE",
            method: "Tie",
            ycard: yourcard,
            dcard: dealercard,
          };
        }
      } else if (options.isDoubleDown === true) {
        if (yourvalue > 21) {
          finalResult2 = {
            result: "DOUBLE LOSE",
            method: "You busted",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (yourvalue === 21) {
          finalResult2 = {
            result: "DOUBLE WIN",
            method: "You had blackjack",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (yourvalue < 21 && dealervalue < yourvalue) {
          finalResult2 = {
            result: "DOUBLE WIN",
            method: "You had more",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (
          dealervalue > yourvalue &&
          dealervalue > 21 &&
          yourvalue < 21
        ) {
          finalResult2 = {
            result: "DOUBLE WIN",
            method: "Dealer busted",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (dealervalue === 21 && yourvalue < 21) {
          finalResult2 = {
            result: "DOUBLE LOSE",
            method: "Dealer had blackjack",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (dealervalue > yourvalue && dealervalue < 21) {
          finalResult2 = {
            result: "DOUBLE LOSE",
            method: "Dealer had more",
            ycard: yourcard,
            dcard: dealercard,
          };
        } else if (dealervalue === yourvalue) {
          finalResult2 = {
            result: "DOUBLE TIE",
            method: "Tie",
            ycard: yourcard,
            dcard: dealercard,
          };
        }
      }
      if (options.transition === "edit") {
        message = await message.edit({
          embeds: message.embeds,
          components: [],
        });
        finalResult2.message = message;
      } else {
        await message.delete();
      }
      return finalResult2;
    } else {
      if (dealervalue === 21 && dealercard.length === 2) {
        if (options.hasInsurance == true) {
          finalResult = {
            result: "INSURANCE PAYOUT",
            method: "You receive insurance against dealer blackjack.",
            ycard: yourcard,
            dcard: dealercard,
          };
          if (options.transition === "edit") {
            message = await message.edit({
              embeds: message.embeds,
              components: [],
            });
            finalResult2.message = message;
          } else {
            await message.delete();
          }
          return finalResult;
        } else {
          finalResult = {
            result: "LOSE",
            method: "You lost (dealer had blackjack).",
            ycard: yourcard,
            dcard: dealercard,
          };
          if (options.transition === "edit") {
            message = await message.edit({
              embeds: message.embeds,
              components: [],
            });
            finalResult2.message = message;
          } else {
            await message.delete();
          }
          return finalResult;
        }
      } else {
        let dealerrank = [dealercard[0].rank, dealercard[1].rank];
        let finalResult = {};
        while (dealervalue < 17) {
          let newCard = DECK.pop();
          dealercard.push(newCard);
          dealerrank.push(newCard.rank);
          if (newCard.rank == "A") {
            if (dealerrank.includes("A")) {
              newCard.value = 1;
            } else {
              newCard.value = 11;
            }
          }
          dealervalue += newCard.value;
          if (dealervalue > 21 && dealerrank.includes("A")) {
            let unu = 0;
            dealercard.forEach((e) => {
              if (e.rank == "A") {
                dealercard[unu].value = 1;
                dealervalue = dealercard
                  .map((d) => d.value)
                  .reduce((a, b) => b + a);
              }
              unu++;
            });
          }
        }

        if (options.hasInsurance == true) {
          if (yourvalue > 21) {
            finalResult = {
              result: "INSURANCE LOSE",
              method: "You lost (busted).",
              ycard: yourcard,
              dcard: dealercard,
            };
          } else if (yourvalue <= 21 && dealervalue < yourvalue) {
            finalResult = {
              result: "INSURANCE WIN",
              method: "You won with more points.",
              ycard: yourcard,
              dcard: dealercard,
            };
          } else if (
            dealervalue > yourvalue &&
            dealervalue > 21 &&
            yourvalue <= 21
          ) {
            finalResult = {
              result: "INSURANCE WIN",
              method: "You won (dealer busted).",
              ycard: yourcard,
              dcard: dealercard,
            };
          } else if (dealervalue > yourvalue && dealervalue <= 21) {
            finalResult = {
              result: "INSURANCE LOSE",
              method: "You lost (dealer had more points).",
              ycard: yourcard,
              dcard: dealercard,
            };
          } else if (dealervalue === yourvalue) {
            finalResult = {
              result: "INSURANCE TIE",
              method: "You tied.",
              ycard: yourcard,
              dcard: dealercard,
            };
          }
        } else if (options.hasInsurance !== true) {
          if (options.isDoubleDown !== true) {
            if (yourvalue > 21) {
              finalResult = {
                result: "LOSE",
                method: "You lost (busted).",
                ycard: yourcard,
                dcard: dealercard,
              };
            } else if (yourvalue <= 21 && dealervalue < yourvalue) {
              finalResult = {
                result: "WIN",
                method: "You won with more points.",
                ycard: yourcard,
                dcard: dealercard,
              };
            } else if (
              dealervalue > yourvalue &&
              dealervalue > 21 &&
              yourvalue <= 21
            ) {
              finalResult = {
                result: "WIN",
                method: "You won (dealer busted).",
                ycard: yourcard,
                dcard: dealercard,
              };
            } else if (dealervalue > yourvalue && dealervalue <= 21) {
              finalResult = {
                result: "LOSE",
                method: "You lost (dealer had more points).",
                ycard: yourcard,
                dcard: dealercard,
              };
            } else if (dealervalue === yourvalue) {
              finalResult = {
                result: "TIE",
                method: "You tied.",
                ycard: yourcard,
                dcard: dealercard,
              };
            }
          } else if (options.isDoubleDown === true) {
            if (yourvalue > 21) {
              finalResult = {
                result: "DOUBLE LOSE",
                method: "Double: You busted.",
                ycard: yourcard,
                dcard: dealercard,
              };
            } else if (yourvalue <= 21 && dealervalue < yourvalue) {
              finalResult = {
                result: "DOUBLE WIN",
                method: "Double: You won with more points.",
                ycard: yourcard,
                dcard: dealercard,
              };
            } else if (
              dealervalue > yourvalue &&
              dealervalue > 21 &&
              yourvalue <= 21
            ) {
              finalResult = {
                result: "DOUBLE WIN",
                method: "Double: You won (dealer busted).",
                ycard: yourcard,
                dcard: dealercard,
              };
            } else if (dealervalue > yourvalue && dealervalue <= 21) {
              finalResult = {
                result: "DOUBLE LOSE",
                method: "Double: You lost (dealer had more points).",
                ycard: yourcard,
                dcard: dealercard,
              };
            } else if (dealervalue === yourvalue) {
              finalResult = {
                result: "DOUBLE TIE",
                method: "Double: You tied.",
                ycard: yourcard,
                dcard: dealercard,
              };
            }
          }
        }

        if (options.transition === "edit") {
          message = await message.edit({
            embeds: message.embeds,
            components: [],
          });
          finalResult.message = message;
        } else {
          await message.delete();
        }
        return finalResult;
      }
    }
  }

  async doubledown(message, userId, yourcard, dealercard, DECK, options) {
    options.isDoubleDown = true;
    if (options.isSplit === "first") {
      options.isFirstSplitDouble = true;
    }
    if (options.isSplit === "second") {
      options.isSecondSplitDouble = true;
    }
    let isSoft = false;
    let newCard = DECK.pop();
    if (newCard.rank === "A") {
      if (yourcard.map((c) => c.rank).includes("A")) {
        newCard.value = 1;
      } else {
        newCard.value = 11;
      }
    }

    yourcard.push(newCard);

    if (
      yourcard.map((c) => c.rank).includes("A") &&
      yourcard.find((c) => c.rank === "A" && c.value === 11)
    ) {
      isSoft = true;
    }

    if (
      yourcard.map((c) => c.value).reduce((a, b) => b + a) > 21 &&
      isSoft == true
    ) {
      isSoft = false;
      for (let y = 0; y < yourcard.length; y++) {
        if (yourcard[y].rank === "A") {
          yourcard[y].value = 1;
        }
      }
    }

    return this.stand(message, userId, yourcard, dealercard, DECK, options);
  }

  async insurance(message, userId, yourcard, dealercard, DECK, options) {
    options.hasInsurance = true;
    let dealervalue = dealercard.map((c) => c.value).reduce((a, b) => b + a);

    if (dealervalue === 21) {
      return this.stand(message, userId, yourcard, dealercard, DECK, options);
    } else {
      let embed = options.embed;
      let hitbtn = {
        label: "Hit",
        style: 1,
        custom_id: "discord-blackjack-hitbtn",
        type: 2,
      };
      let standbtn = {
        label: "Stand",
        style: 1,
        custom_id: "discord-blackjack-standbtn",
        type: 2,
      };
      let ddownbtn = {
        label: "Double Down",
        style: 1,
        custom_id: "discord-blackjack-ddownbtn",
        type: 2,
      };
      let splitbtn = {
        label: "Split",
        style: 1,
        custom_id: "discord-blackjack-splitbtn",
        type: 2,
      };
      let cancelbtn = {
        label: "Cancel",
        style: 4,
        custom_id: "discord-blackjack-cancelbtn",
        type: 2,
      };
      let row1 = { type: 1, components: [hitbtn, standbtn] };
      let row2 = { type: 1, components: [cancelbtn] };
      let components = [row1, row2];
      while (components.length == 2 && components[0].components.length > 2) {
        components[0].components.pop();
      }
      if (options.transition === "edit") {
        if (options.commandType === "message") {
          message = await message.edit({ embeds: [embed], components });
        } else {
          message = await message.edit({ embeds: [embed], components });
        }
      } else {
        if (options.commandType === "message") {
          await message.delete();
          message = await message.channel.send({ embeds: [embed], components });
        } else {
          if (!message.ephemeral) {
            await message.delete();
          }
          message = await message.channel.send({ embeds: [embed], components });
        }
      }
      return options.buttons
        ? this.buttonCollect(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          )
        : this.messageCollect(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          );
    }
  }

  async noinsurance(message, userId, yourcard, dealercard, DECK, options) {
    options.hasInsurance = false;
    let dealervalue = dealercard.map((c) => c.value).reduce((a, b) => b + a);

    if (dealervalue === 21) {
      return this.stand(message, userId, yourcard, dealercard, DECK, options);
    } else {
      let embed = options.embed;
      let hitbtn = {
        label: "Hit",
        style: 1,
        custom_id: "discord-blackjack-hitbtn",
        type: 2,
      };
      let standbtn = {
        label: "Stand",
        style: 1,
        custom_id: "discord-blackjack-standbtn",
        type: 2,
      };
      let ddownbtn = {
        label: "Double Down",
        style: 1,
        custom_id: "discord-blackjack-ddownbtn",
        type: 2,
      };
      let splitbtn = {
        label: "Split",
        style: 1,
        custom_id: "discord-blackjack-splitbtn",
        type: 2,
      };
      let cancelbtn = {
        label: "Cancel",
        style: 4,
        custom_id: "discord-blackjack-cancelbtn",
        type: 2,
      };
      let row1 = { type: 1, components: [hitbtn, standbtn] };
      let row2 = { type: 1, components: [cancelbtn] };
      let components = [row1, row2];
      while (components.length == 2 && components[0].components.length > 2) {
        components[0].components.pop();
      }
      if (options.transition === "edit") {
        if (options.commandType === "message") {
          message = await message.edit({ embeds: [embed], components });
        } else {
          message = await message.edit({ embeds: [embed], components });
        }
      } else {
        if (options.commandType === "message") {
          await message.delete();
          message = await message.channel.send({ embeds: [embed], components });
        } else {
          if (!message.ephemeral) {
            await message.delete();
          }
          message = await message.channel.send({ embeds: [embed], components });
        }
      }
      return options.buttons
        ? this.buttonCollect(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          )
        : this.messageCollect(
            message,
            userId,
            yourcard,
            dealercard,
            DECK,
            options
          );
    }
  }

  async split(message, userId, yourcard, dealercard, DECK, options) {
    options.isSplit = "first";
    let yourcard2 = [yourcard.pop()];

    if (yourcard[0].rank === "A") {
      yourcard[0].value = 11;
    }

    if (yourcard2[0].rank === "A") {
      yourcard2[0].value = 11;
    }

    options.secondHand = yourcard2;

    return this.hit(message, userId, yourcard, dealercard, DECK, options);
  }

  async cancel(message, userId, yourcard, dealercard, DECK, options) {
    if (options.transition === "edit") {
      return {
        result: "CANCEL",
        method: "None",
        ycard: yourcard,
        dcard: dealercard,
        message: message,
      };
    } else {
      return {
        result: "CANCEL",
        method: "None",
        ycard: yourcard,
        dcard: dealercard,
      };
    }
  }
}

/** 
    * @param {Discord.Message || Discord.CommandInteraction} message The Message Object or the Interaction Object sent by the user
    * @param {object} options The options object (optional)
    * @returns Promise<Object>
    * @async
    * @example
    * const blackjack = require("discord-blackjack")
    * // other code here
    *
    * // if you are using prefix commands
    * client.on("messageCreate", async message => {
    *     if (message.content === "!blackjack") {
    *         blackjack(message)        
    *     }
    * })

    * // if you are using slash commands
    * client.on("interactionCreate", async interaction => {
    *     if (!interaction.isCommand) return;
    *     
    *     if (interaction.commandName === "blackjack") {
    *         blackjack(interaction)
    *     }
    * })
    * 
    * // other code here
*/

module.exports = async (message, options) => {
  // check if all the variables given are valid
  if (!message)
    throw new Error(
      "[MISSING_PARAMETER] The message or interaction parameter was not provided, was null or undefined."
    );

  // check if message and commandInteraction aren't something made up
  if (
    !(message instanceof Discord.Message) &&
    !(message instanceof Discord.CommandInteraction)
  )
    throw new Error(
      "[INVALID_PARAMATER] The message or interaction parameter provided is not valid."
    );

  // set all the options
  if (!options) options = {}; // if options were not provided, make an empty object
  options.transition === "edit"
    ? (options.transition = "edit")
    : (options.transition = "delete"); // how they want the embeds to be transitioned
  options.buttons === false
    ? (options.buttons = false)
    : (options.buttons = true); // check if buttons were enabled
  options.doubledown === false
    ? (options.doubledown = false)
    : (options.doubledown = true); // check if double down should appear
  options.insurance === false
    ? (options.insurance = false)
    : (options.insurance = true); // check if double down should appear
  options.split === false ? (options.split = false) : (options.split = true); // check if split should appear
  options.resultEmbed === false
    ? (options.resultEmbed = false)
    : (options.resultEmbed = true); // check if the result embed should be displayed
  options.normalEmbed === false
    ? (options.normalEmbed = false)
    : (options.normalEmbed = true); // check if they want the default embed when playing
  !options.emojis ? (options.emojis = {}) : options.emojis;

  options.emojis = {
    clubs: options.emojis?.clubs || "♣️",
    spades: options.emojis?.spades || "♠️",
    hearts: options.emojis?.hearts || "♥️",
    diamonds: options.emojis?.diamonds || "♦️",
  };

  // set what type the message is
  let commandType;
  if (message instanceof Discord.Message) {
    commandType = "message";
  } else if (message instanceof Discord.CommandInteraction) {
    commandType = "interaction";
  }

  options.commandType = commandType;

  // check if options is an object
  if (options && !(options instanceof Object))
    throw new Error(
      `[INVALID_PARAMATER] The options parameter expected an object, but recieved ${
        Array.isArray(options) ? "array" : typeof options
      }`
    );

  // check if the emojis option is an object
  if (typeof options.emojis !== "object")
    throw new Error(
      `[INVALID_PARAMATER] The options.emojis parameter expected an object, but recieved ${typeof options}.`
    );

  // check if the properties for the options.emojis object are strings.
  if (typeof options.emojis.spades !== "string")
    throw new Error(
      `[INVALID_PARAMATER] The emojis.spades option expected a string, but recieved ${typeof options
        .emojis.spades}`
    );
  if (typeof options.emojis.hearts !== "string")
    throw new Error(
      `[INVALID_PARAMATER] The emojis.hearts option expected a string, but recieved ${typeof options
        .emojis.hearts}`
    );
  if (typeof options.emojis.diamonds !== "string")
    throw new Error(
      `[INVALID_PARAMATER] The emojis.diamonds option expected a string, but recieved ${typeof options
        .emojis.diamonds}`
    );
  if (typeof options.emojis.clubs !== "string")
    throw new Error(
      `[INVALID_PARAMATER] The emojis.clubs option expected a string, but recieved ${typeof options
        .emojis.clubs}`
    );

  // check if the normalEmbed option was set to false but normalEmbedContent was not provided
  if (options.normalEmbed === false && !options.normalEmbedContent)
    throw new Error(
      "[MISSING_PARAMETER] The normalEmbedContent option was not provided, was null or undefined when normalEmbed was set to false."
    );

  // check if the normalEmbed option was set to false but normalEmbedContent is not a MessageEmbed
  if (
    options.normalEmbed === false &&
    typeof options.normalEmbedContent !== "object"
  )
    throw new Error(
      "[INVALID_PARAMATER] The normalEmbedContent parameter provided is not valid."
    );

  let starterMessage;

  // defer the reply if the commandType is interaction and if the reply has not been deffered
  if (commandType === "interaction" && !message.deferred && !message.replied) {
    starterMessage = await message.deferReply();
  } else if (commandType === "message") {
    starterMessage = await message.channel.send({
      embeds: [
        {
          title: "Game is starting.",
          description: "The game is starting soon, get ready!",
        },
      ],
    });
  }

  // check if the user is playing a game
  if (games.has(message.member.id)) {
    if (commandType === "message") {
      message.reply("You are already playing a game!");
    } else if (commandType === "interaction") {
      if (message.replied || message.deferred) {
        message.followUp({ content: "You are already playing a game!" });
      } else {
        message.reply({ content: "You are already playing a game!" });
      }
    }
    return {
      result: "None",
      method: "None",
      ycard: "None",
      dcard: "None",
    };
  }

  // set all the variables
  let normalEmbedContent = options.normalEmbedContent ?? "None";
  let transition = options.transition;
  let buttons = options.buttons;
  let doubledown = options.doubledown;
  let insurance = options.insurance;
  let split = options.split;
  let resultEmbed = options.resultEmbed;
  let normalEmbed = options.normalEmbed;
  let userId = message.member.id;
  let isSoft = false;
  let method = "None";
  let copiedEmbed = {
    content: "",
    value: "",
  };

  // set the decks
  let DECK = [
    { suit: "clubs", rank: "A", value: [1, 11], emoji: options.emojis.clubs },
    { suit: "clubs", rank: "2", value: 2, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "3", value: 3, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "4", value: 4, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "5", value: 5, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "6", value: 6, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "7", value: 7, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "8", value: 8, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "9", value: 9, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "10", value: 10, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "J", value: 10, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "Q", value: 10, emoji: options.emojis.clubs },
    { suit: "clubs", rank: "K", value: 10, emoji: options.emojis.clubs },

    {
      suit: "diamonds",
      rank: "A",
      value: [1, 11],
      emoji: options.emojis.diamonds,
    },
    { suit: "diamonds", rank: "2", value: 2, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "3", value: 3, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "4", value: 4, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "5", value: 5, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "6", value: 6, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "7", value: 7, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "8", value: 8, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "9", value: 9, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "10", value: 10, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "J", value: 10, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "Q", value: 10, emoji: options.emojis.diamonds },
    { suit: "diamonds", rank: "K", value: 10, emoji: options.emojis.diamonds },

    { suit: "hearts", rank: "A", value: [1, 11], emoji: options.emojis.hearts },
    { suit: "hearts", rank: "2", value: 2, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "3", value: 3, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "4", value: 4, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "5", value: 5, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "6", value: 6, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "7", value: 7, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "8", value: 8, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "9", value: 9, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "10", value: 10, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "J", value: 10, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "Q", value: 10, emoji: options.emojis.hearts },
    { suit: "hearts", rank: "K", value: 10, emoji: options.emojis.hearts },

    { suit: "spades", rank: "A", value: [1, 11], emoji: options.emojis.spades },
    { suit: "spades", rank: "2", value: 2, emoji: options.emojis.spades },
    { suit: "spades", rank: "3", value: 3, emoji: options.emojis.spades },
    { suit: "spades", rank: "4", value: 4, emoji: options.emojis.spades },
    { suit: "spades", rank: "5", value: 5, emoji: options.emojis.spades },
    { suit: "spades", rank: "6", value: 6, emoji: options.emojis.spades },
    { suit: "spades", rank: "7", value: 7, emoji: options.emojis.spades },
    { suit: "spades", rank: "8", value: 8, emoji: options.emojis.spades },
    { suit: "spades", rank: "9", value: 9, emoji: options.emojis.spades },
    { suit: "spades", rank: "10", value: 10, emoji: options.emojis.spades },
    { suit: "spades", rank: "J", value: 10, emoji: options.emojis.spades },
    { suit: "spades", rank: "Q", value: 10, emoji: options.emojis.spades },
    { suit: "spades", rank: "K", value: 10, emoji: options.emojis.spades },
  ];

  let hitbtn = {
    label: "Hit",
    style: 1,
    custom_id: "discord-blackjack-hitbtn",
    type: 2,
  };
  let standbtn = {
    label: "Stand",
    style: 1,
    custom_id: "discord-blackjack-standbtn",
    type: 2,
  };
  let ddownbtn = {
    label: "Double Down",
    style: 1,
    custom_id: "discord-blackjack-ddownbtn",
    type: 2,
  };
  let splitbtn = {
    label: "Split",
    style: 1,
    custom_id: "discord-blackjack-splitbtn",
    type: 2,
  };
  let insbtn = {
    label: "Insurance",
    style: 1,
    custom_id: "discord-blackjack-insbtn",
    type: 2,
  };
  let noinsbtn = {
    label: "No Insurance",
    style: 4,
    custom_id: "discord-blackjack-noinsbtn",
    type: 2,
  };
  let cancelbtn = {
    label: "Cancel",
    style: 4,
    custom_id: "discord-blackjack-cancelbtn",
    type: 2,
  };

  let row1 = { type: 1, components: [hitbtn, standbtn] };
  let row2 = { type: 1, components: [cancelbtn] };

  shuffle(DECK);
  shuffle(DECK);
  shuffle(DECK);
  shuffle(DECK);
  shuffle(DECK);

  let currentDeck = DECK;
  let testDeck = [
    { suit: "spades", rank: "5", value: 5, emoji: options.emojis.spades },
    { suit: "spades", rank: "5", value: 5, emoji: options.emojis.spades },
  ];
  let testDeck2 = [
    { suit: "spades", rank: "A", value: [1, 11], emoji: options.emojis.spades },
    { suit: "spades", rank: "10", value: 10, emoji: options.emojis.spades },
  ];
  // shuffle(testDeck)
  // shuffle(testDeck2)
  let yourcards = [currentDeck.pop(), currentDeck.pop()];
  // let yourcards = [testDeck[0],testDeck[1]]

  let dealercards = [currentDeck.pop(), currentDeck.pop()];
  // let dealercards = [testDeck2[0],testDeck2[1]]

  // set the embeds
  let winEmbed = {
    title: "You won!",
    color: 0x008800,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let loseEmbed = {
    title: "You lost!",
    color: 0xff0000,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let tieEmbed = {
    title: "It's a tie.",
    color: 0xffff00,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitWinEmbed = {
    title: "You split and won both hands!",
    color: 0x008800,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitLoseEmbed = {
    title: "You split and lost both hands!",
    color: 0xff0000,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitTieEmbed = {
    title: "You split and tied both hands!",
    color: 0xffff00,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitTieWinEmbed = {
    title: "You split: First hand ties and second hand wins.",
    color: 0x008800,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitWinTieEmbed = {
    title: "You split: First hand wins and second hand ties.",
    color: 0x008800,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitTieLoseEmbed = {
    title: "You split: First hand ties and second hand loses.",
    color: 0xff0000,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitLoseTieEmbed = {
    title: "You split: First hand loses and second hand ties.",
    color: 0xff0000,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitWinLoseEmbed = {
    title: "You split: First hand wins and second hand loses.",
    color: 0xffff00,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let splitLoseWinEmbed = {
    title: "You split: First hand loses and second hand wins.",
    color: 0xffff00,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let insWinEmbed = {
    title: "You won (paid insurance)!",
    color: 0x008800,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let insLoseEmbed = {
    title: "You lost (paid insurance)!",
    color: 0xff0000,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let insTieEmbed = {
    title: "It's a tie (paid insurance).",
    color: 0xff0000,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let insPayEmbed = {
    title: "Insurance Payout!",
    color: 0x008800,
    description: "",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.user.displayAvatarURL(),
    },
  };
  let timeoutEmbed = {
    title: "Time's up!",
    color: 0xff0000,
    description:
      "You took more than 30 seconds to respond. The time is up and the game has canceled.",
    fields: [],
    author: {
      name: message.member.user.tag,
      icon_url: message.member.displayAvatarURL(),
    },
  };
  let cancelEmbed = {
    title: "Game canceled.",
    color: 0xff0000,
    description: "You decided to cancel your ongoing blackjack game.",
    fields: [],
    author: {
      name: message.member.displayName,
      icon_url: message.member.displayAvatarURL(),
    },
  };
  let generalEmbed =
    normalEmbed === false
      ? options.normalEmbedContent
      : {
          title: "Blackjack",
          color: Math.floor(Math.random() * (0xffffff + 1)),
          fields: [
            { name: "Your hand", value: "", inline: true },
            { name: `Dealer's hand`, value: "", inline: true },
          ],
          author: {
            name: message.member.displayName,
            icon_url: message.member.user.displayAvatarURL(),
          },
        };

  // set the filters
  let allFilter = ["h", "hit", "s", "stand", "cancel"];

  if (yourcards[0].rank === yourcards[1].rank && yourcards[0].rank === "A") {
    yourcards[0].value = 11;
    yourcards[1].value = 1;
    isSoft = true;
  } else if (yourcards[0].rank === "A") {
    yourcards[0].value = 11;
  } else if (yourcards[1].rank === "A") {
    yourcards[1].value = 11;
  }

  if (
    dealercards[0].rank === dealercards[1].rank &&
    dealercards[0].rank === "A"
  ) {
    dealercards[0].value = 11;
    dealercards[1].value = 1;
    isSoft = true;
  } else if (dealercards[0].rank === "A") {
    dealercards[0].value = 11;
  } else if (dealercards[1].rank === "A") {
    dealercards[1].value = 11;
  }

  if (yourcards.map((c) => c.rank).includes("A")) isSoft = true;

  generalEmbed.fields[0].value = `Cards: ${yourcards
    .map((c) => `[\`${c.emoji} ${c.rank}\`](https://google.com)`)
    .join(" ")}\nTotal:${isSoft ? " Soft" : ""} ${yourcards
    .map((c) => c.value)
    .reduce((a, b) => b + a)}`;
  generalEmbed.fields[1].value = `Cards: [\`${dealercards[0].emoji} ${dealercards[0].rank}\`](https://google.com) \` ? \`\nTotal: \` ? \``;

  options.embed = generalEmbed;
  let yourvalue = yourcards.map((c) => c.value).reduce((a, b) => b + a);
  let dealervalue = dealercards.map((c) => c.value).reduce((a, b) => b + a);

  // check if we can do double down
  if (doubledown === true) {
    if (
      yourcards.map((a) => a.value).reduce((a, b) => b + a) === 9 ||
      yourcards.map((a) => a.value).reduce((a, b) => b + a) === 10 ||
      yourcards.map((a) => a.value).reduce((a, b) => b + a) === 11
    ) {
      row1.components.push(ddownbtn);
      allFilter.push("d");
      allFilter.push("doubledown");
    }
  }

  // check if we can do split
  if (yourcards[0].rank === yourcards[1].rank && split === true) {
    row1.components.push(splitbtn);
    allFilter.push("split");
  }

  // check if we offer insurance
  if (dealercards[0].rank === "A" && insurance === true) {
    if (yourvalue != 21) {
      row1.components = [];
      row1.components.push(insbtn);
      row1.components.push(noinsbtn);
      allFilter.push("i");
      allFilter.push("insurance");
      allFilter.push("ni");
      allFilter.push("noinsurance");
    }
  }

  // start the game
  if (yourvalue === 21 && dealervalue != 21) {
    if (options.resultEmbed === true) {
      winEmbed.description = "You won with blackjack.";
      winEmbed.fields.push({
        name: "Your hand",
        value: `Cards: [\`${yourcards[0].emoji} ${yourcards[0].rank}\`](https://google.com) [\`${yourcards[1].emoji} ${yourcards[1].rank}\`](https://google.com)\nTotal: ${yourvalue}`,
      });
      winEmbed.fields.push({
        name: "Dealer's hand",
        value: `Card: [\`${dealercards[0].emoji} ${dealercards[0].rank}\`](https://google.com) [\`${dealercards[1].emoji} ${dealercards[1].rank}\`](https://google.com)\nTotal: ${dealervalue}`,
      });
      commandType === "message"
        ? message.channel.send({ embeds: [winEmbed] })
        : message.channel.send({ embeds: [winEmbed] });
    }

    return {
      result: "BLACKJACK",
      method: "You won with blackjack.",
      ycard: yourcards,
      dcard: dealercards,
    };
  }

  // else if (dealervalue === 21 && yourvalue != 21) {
  //     if (options.resultEmbed === true) {
  //         loseEmbed.description = "You lost (dealer had blackjack)."
  //         loseEmbed.fields.push({ name: "Your hand", value: `Cards: [\`${yourcards[0].emoji} ${yourcards[0].rank}\`](https://google.com) [\`${yourcards[1].emoji} ${yourcards[1].rank}\`](https://google.com)\nTotal: ${yourvalue}` })
  //         loseEmbed.fields.push({ name: "Dealer's hand", value: `Cards: [\`${dealercards[0].emoji} ${dealercards[0].rank}\`](https://google.com) [\`${dealercards[1].emoji} ${dealercards[1].rank}\`](https://google.com)\nTotal: ${dealervalue}` })
  //         commandType === "message" ? message.channel.send({ embeds: [loseEmbed] }) : message.channel.send({ embeds: [loseEmbed] })
  //     }

  //     return {
  //         result: "LOSE",
  //         method: "You lost (dealer had blackjack).",
  //         ycard: yourcards,
  //         dcard: dealercards
  //     }
  // }
  else if (dealervalue === 21 && dealervalue == yourvalue) {
    if (options.resultEmbed === true) {
      tieEmbed.description = "You tied (both had blackjack).";
      tieEmbed.fields.push({
        name: "Your hand",
        value: `Cards: [\`${yourcards[0].emoji} ${yourcards[0].rank}\`](https://google.com) [\`${yourcards[1].emoji} ${yourcards[1].rank}\`](https://google.com)\nTotal: ${yourvalue}`,
      });
      tieEmbed.fields.push({
        name: "Dealer's hand",
        value: `Cards: [\`${dealercards[0].emoji} ${dealercards[0].rank}\`](https://google.com) [\`${dealercards[1].emoji} ${dealercards[1].rank}\`](https://google.com)\nTotal: ${dealervalue}`,
      });
      commandType === "message"
        ? message.channel.send({ embeds: [tieEmbed] })
        : message.channel.send({ embeds: [tieEmbed] });
    }

    return {
      result: "TIE",
      method: "You tied (both had blackjack).",
      ycard: yourcards,
      dcard: dealercards,
    };
  }

  const editReply = async (msg, reply, commandType) => {
    if (commandType === "message") {
      return await msg.edit({
        embeds: [reply],
        components: buttons ? [row1, row2] : [],
      });
    } else {
      return await message.editReply({
        embeds: [reply],
        components: buttons ? [row1, row2] : [],
      });
    }
  };

  let currentMessage = await editReply(
    starterMessage,
    generalEmbed,
    commandType
  );
  let finalResult = await (options.buttons
    ? new Collect().buttonCollect(
        currentMessage,
        userId,
        yourcards,
        dealercards,
        currentDeck,
        options
      )
    : new Collect().messageCollect(
        currentMessage,
        userId,
        yourcards,
        dealercards,
        currentDeck,
        options,
        allFilter
      ));

  if (options.resultEmbed === true) {
    let resultingEmbed = {
      WIN: winEmbed,
      BLACKJACK: winEmbed,
      LOSE: loseEmbed,
      TIE: tieEmbed,
      "DOUBLE WIN": winEmbed,
      "DOUBLE LOSE": loseEmbed,
      "DOUBLE TIE": tieEmbed,
      "SPLIT WIN-LOSE": splitWinLoseEmbed,
      "SPLIT LOSE-WIN": splitLoseWinEmbed,
      "SPLIT TIE-TIE": splitTieEmbed,
      "SPLIT WIN-WIN": splitWinEmbed,
      "SPLIT LOSE-LOSE": splitLoseEmbed,
      "SPLIT TIE-WIN": splitTieWinEmbed,
      "SPLIT WIN-TIE": splitWinTieEmbed,
      "SPLIT TIE-LOSE": splitTieLoseEmbed,
      "SPLIT LOSE-TIE": splitLoseTieEmbed,
      "SPLIT BLACKJACK-WIN": splitWinEmbed,
      "SPLIT WIN-BLACKJACK": splitWinEmbed,
      "SPLIT BLACKJACK-LOSE": splitWinLoseEmbed,
      "SPLIT LOSE-BLACKJACK": splitLoseWinEmbed,
      "SPLIT BLACKJACK-BLACKJACK": splitWinEmbed,
      "SPLIT BLACKJACK-TIE": splitWinTieEmbed,
      "SPLIT TIE-BLACKJACK": splitTieWinEmbed,
      "SPLIT DOUBLE WIN-LOSE": splitWinLoseEmbed,
      "SPLIT DOUBLE LOSE-WIN": splitLoseWinEmbed,
      "SPLIT DOUBLE TIE-TIE": splitTieEmbed,
      "SPLIT DOUBLE WIN-WIN": splitWinEmbed,
      "SPLIT DOUBLE LOSE-LOSE": splitLoseEmbed,
      "SPLIT DOUBLE TIE-WIN": splitTieWinEmbed,
      "SPLIT DOUBLE WIN-TIE": splitWinTieEmbed,
      "SPLIT DOUBLE TIE-LOSE": splitTieLoseEmbed,
      "SPLIT DOUBLE LOSE-TIE": splitLoseTieEmbed,
      "SPLIT DOUBLE BLACKJACK-WIN": splitWinEmbed,
      "SPLIT DOUBLE WIN-BLACKJACK": splitWinEmbed,
      "SPLIT DOUBLE BLACKJACK-LOSE": splitWinLoseEmbed,
      "SPLIT DOUBLE LOSE-BLACKJACK": splitLoseWinEmbed,
      "SPLIT DOUBLE BLACKJACK-BLACKJACK": splitWinEmbed,
      "SPLIT DOUBLE BLACKJACK-TIE": splitWinTieEmbed,
      "SPLIT DOUBLE TIE-BLACKJACK": splitTieWinEmbed,
      "SPLIT WIN-DOUBLE LOSE": splitWinLoseEmbed,
      "SPLIT LOSE-DOUBLE WIN": splitLoseWinEmbed,
      "SPLIT TIE-DOUBLE TIE": splitTieEmbed,
      "SPLIT WIN-DOUBLE WIN": splitWinEmbed,
      "SPLIT LOSE-DOUBLE LOSE": splitLoseEmbed,
      "SPLIT TIE-DOUBLE WIN": splitTieWinEmbed,
      "SPLIT WIN-DOUBLE TIE": splitWinTieEmbed,
      "SPLIT TIE-DOUBLE LOSE": splitTieLoseEmbed,
      "SPLIT LOSE-DOUBLE TIE": splitLoseTieEmbed,
      "SPLIT BLACKJACK-DOUBLE WIN": splitWinEmbed,
      "SPLIT WIN-DOUBLE BLACKJACK": splitWinEmbed,
      "SPLIT BLACKJACK-DOUBLE LOSE": splitWinLoseEmbed,
      "SPLIT LOSE-DOUBLE BLACKJACK": splitLoseWinEmbed,
      "SPLIT BLACKJACK-DOUBLE BLACKJACK": splitWinEmbed,
      "SPLIT BLACKJACK-DOUBLE TIE": splitWinTieEmbed,
      "SPLIT TIE-DOUBLE BLACKJACK": splitTieWinEmbed,
      "SPLIT DOUBLE WIN-DOUBLE LOSE": splitWinLoseEmbed,
      "SPLIT DOUBLE LOSE-DOUBLE WIN": splitLoseWinEmbed,
      "SPLIT DOUBLE TIE-DOUBLE TIE": splitTieEmbed,
      "SPLIT DOUBLE WIN-DOUBLE WIN": splitWinEmbed,
      "SPLIT DOUBLE LOSE-DOUBLE LOSE": splitLoseEmbed,
      "SPLIT DOUBLE TIE-DOUBLE WIN": splitTieWinEmbed,
      "SPLIT DOUBLE WIN-DOUBLE TIE": splitWinTieEmbed,
      "SPLIT DOUBLE TIE-DOUBLE LOSE": splitTieLoseEmbed,
      "SPLIT DOUBLE LOSE-DOUBLE TIE": splitLoseTieEmbed,
      "SPLIT DOUBLE BLACKJACK-DOUBLE WIN": splitWinEmbed,
      "SPLIT DOUBLE WIN-DOUBLE BLACKJACK": splitWinEmbed,
      "SPLIT DOUBLE BLACKJACK-DOUBLE LOSE": splitWinLoseEmbed,
      "SPLIT DOUBLE LOSE-DOUBLE BLACKJACK": splitLoseWinEmbed,
      "SPLIT DOUBLE BLACKJACK-DOUBLE BLACKJACK": splitWinEmbed,
      "SPLIT DOUBLE BLACKJACK-DOUBLE TIE": splitWinTieEmbed,
      "SPLIT DOUBLE TIE-DOUBLE BLACKJACK": splitTieWinEmbed,
      "INSURANCE PAYOUT": insPayEmbed,
      "INSURANCE WIN": insWinEmbed,
      "INSURANCE LOSE": insLoseEmbed,
      "INSURANCE TIE": insTieEmbed,
      CANCEL: cancelEmbed,
      TIMEOUT: timeoutEmbed,
    };

    let finalEmbed = resultingEmbed[finalResult.result];
    if (finalResult.method !== "None") {
      finalEmbed.description = finalResult.method;
    }
    finalEmbed.fields.push({
      name: `Your hand`,
      value: `Cards: ${finalResult.ycard
        .map((c) => `[\`${c.emoji} ${c.rank}\`](https://google.com)`)
        .join(" ")}\nTotal: ${finalResult.ycard
        .map((card) => card.value)
        .reduce((a, b) => b + a)}`,
      inline: true,
    });
    if (finalResult.ycard2 != null) {
      finalEmbed.fields.push({
        name: `Your 2nd hand`,
        value: `Cards: ${finalResult.ycard2
          .map((c) => `[\`${c.emoji} ${c.rank}\`](https://google.com)`)
          .join(" ")}\nTotal: ${finalResult.ycard2
          .map((card) => card.value)
          .reduce((a, b) => b + a)}`,
        inline: true,
      });
    }
    finalEmbed.fields.push({
      name: `${message.client.user.username}'s hand`,
      value: `Cards: ${finalResult.dcard
        .map((c) => `[\`${c.emoji} ${c.rank}\`](https://google.com)`)
        .join(" ")}\nTotal: ${finalResult.dcard
        .map((card) => card.value)
        .reduce((a, b) => b + a)}`,
      inline: true,
    });
    options.commandType === "message"
      ? message.channel.send({ embeds: [finalEmbed] })
      : message.channel.send({ embeds: [finalEmbed] });
  }
  return finalResult;
};
