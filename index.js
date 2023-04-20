const Client = require("./structures/Client");
const client = new Client({ ws: { properties: { browser: "Discord iOS" }} });
client.start();
