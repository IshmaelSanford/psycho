const Enmap = require("enmap");

class MiscPlugin {
  constructor(client) {
    this.client = client;

    this.afkDatabase = new Enmap({
      name: "afk",
      autoEnsure: {
        afk: false,
        message: "",
        start: 0,
      },
    });

    this.remindersDatabase = new Enmap({ name: "reminders" });
  }

  setAFK(guild, user, status) {
    this.afkDatabase.set(`${guild.id}-${user.id}`, status, "afk");
    this.afkDatabase.set(`${guild.id}-${user.id}`, Date.now(), "start");
  }
  
  setMessage(guild, user, message) {
    return this.afkDatabase.set(`${guild.id}-${user.id}`, message, "message");
  }
  
  getAFK(guild, user) {
    return this.afkDatabase.get(`${guild.id}-${user.id}`, "afk");
  }
  
  getAFKStart(guild, user) {
    return this.afkDatabase.get(`${guild.id}-${user.id}`, "start");
  }
  
  getAFKMessage(guild, user) {
    return this.afkDatabase.get(`${guild.id}-${user.id}`, "message");
  }
  
  getMessage(guild, user) {
    return this.afkDatabase.get(`${guild.id}-${user.id}`, "message");
  }
}

module.exports = MiscPlugin;
