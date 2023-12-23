const { App } = require("@slack/bolt");

const handleAddLineStampCommand = require("@slack-app/event-handlers/handle-add-line-stamps");
require("dotenv").config();

class SlackApp {
  constructor() {
    // 環境変数の読み込み
    this.loadEnv();

    // Appの初期化
    this.app = new App({
      token: this.BOT_TOKEN,
      signingSecret: this.SIGNING_SECRET,
      socketMode: true,
      appToken: this.APP_TOKEN,
    });

    // イベントハンドラのセット (LINEスタンプをSlack絵文字として登録)
    this.app.command("/add-line-stamp", async ({ ack, command, say }) => {
      await handleAddLineStampCommand(ack, command, say);
    });
  }

  // 環境変数を読み込む
  loadEnv() {
    this.BOT_TOKEN = process.env.BOT_USER_OAUTH_TOKEN;
    this.SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
    this.APP_TOKEN = process.env.SLACK_APP_TOKEN;
  }

  // Appの起動
  async start() {
    await this.app.start();
    console.log("Bolt app is running!");
  }
}

module.exports = SlackApp;
