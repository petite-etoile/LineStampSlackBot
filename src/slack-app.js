const { App } = require("@slack/bolt");
require("dotenv").config();
const { saveLineStamps } = require("./line-stamp-util");
const slackClient = require("./slack-client");

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

  /**
   * /add-line-stampコマンドを叩かれたら呼ばれる関数
   *
   * 1. 引数のチェック
   * 2. LINEスタンプを保存（スクレイピング）
   * 3. LINEスタンプをSlack絵文字として登録
   * 4. Slackに結果を投稿
   */
  async handleCommand(ack, command, say) {
    console.log("\n\n----handleCommand----\n");
    console.log(command);

    try {
      // コマンドを受け取ったことを確認
      await ack();

      // ToDo: コマンドの叩き方をチェックして不適切だったらエラーメッセージを返す
      /* 
      const error_message = validateArgs(command);
      if (error_message) {
        await say(error_message);
        return;
      } 
      */

      // コマンドの引数をパース
      const [url, stamp_name] = command.text.split(" ");

      // LINEスタンプを保存
      const stamps_file_paths = await saveLineStamps(url, stamp_name);

      // LINEスタンプをSlack絵文字として登録
      await this.#registerLineStampsToSlack(stamp_name, stamps_file_paths);

      // Slackに結果を投稿
      await this.#postResultToChannel(command, stamps_file_paths[0]);
    } catch (ex) {
      console.error(ex);
      console.log("---------------------");
      console.error(ex.name);
      console.log("---------------------");
      console.error(ex.errors);
      // slack側でエラー文を見れるように
      // await say(`予期せぬエラーが発生しました: \n\n${ex}`);
    }
  }

  // LINEスタンプをSlack絵文字として登録する関数
  #registerLineStampsToSlack(stampName, stampsFilePaths) {
    console.log("start register line stamps to slack");

    console.log("end register line stamps to slack");
  }

  // Slackに結果を投稿する関数
  async #postResultToChannel(command, thumbnailPath) {
    // 処理
  }
}

module.exports = SlackApp;
