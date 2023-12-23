const { saveLineStamps } = require("@utils/line-stamp-util");
const registerAllLineStampsToSlack = require("@slack-app/slack-api-client/register-slack-emoji");

/**
 * /add-line-stampコマンドを叩かれたら呼ばれる関数
 *
 * 1. 引数のチェック
 * 2. LINEスタンプを保存（スクレイピング）
 * 3. LINEスタンプをSlack絵文字として登録
 * 4. Slackに結果を投稿
 */
async function handleAddLineStampCommand(ack, command, say) {
  console.log(
    "\n\n============================ handle Add Line Stamp Command ============================\n"
  );
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
    await registerLineStampsToSlack(stamp_name, stamps_file_paths);

    // Slackに結果を投稿
    await postResultToChannel(command, stamps_file_paths[0]);
  } catch (ex) {
    console.error(ex);
    console.log("=====================");
    console.error(ex.name);
    console.log("=====================");
    console.error(ex.errors);
    // slack側でエラー文を見れるように
    // await say(`予期せぬエラーが発生しました: \n\n${ex}`);
  }
}

// LINEスタンプをSlack絵文字として登録する関数
function registerLineStampsToSlack(stampName, stampsFilePaths) {
  console.log("start register line stamps to slack");

  registerAllLineStampsToSlack(stampName, stampsFilePaths);

  console.log("end register line stamps to slack");
}

// Slackに結果を投稿する関数
async function postResultToChannel(command) {
  // 処理
}

module.exports = handleAddLineStampCommand;
