const SlackApp = require("./slack-app");

const slackApp = new SlackApp();
slackApp.start();

const { saveLineStamps } = require("./line-stamp-util");
console.log("saveLineStamps");
console.log(saveLineStamps);
