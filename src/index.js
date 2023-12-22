const SlackApp = require("./slack-app");
const { saveLineStamps } = require("./line-stamp-util");

const slackApp = new SlackApp();
slackApp.start();

console.log("saveLineStamps");
console.log(saveLineStamps);
