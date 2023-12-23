// package.jsonに設定したパスエイリアスを登録
require("module-alias/register");

const SlackApp = require("./slack-app/slack-app");
const slackApp = new SlackApp();
slackApp.start();
