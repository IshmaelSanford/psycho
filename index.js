const Client = require("./structures/Client");
const client = new Client({ ws: { properties: config.wsProperties } });
client.start();
