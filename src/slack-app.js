const { App } = require("@slack/bolt");
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

    // イベントハンドラのセット
    this.app.command("/add-line-stamp", async ({ ack, command, say }) => {
      await this.handleCommand(ack, command, say);
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

  async handleCommand(ack, command, say) {
    // コマンドの処理
  }
}

const slackApp = new SlackApp();
slackApp.start();
