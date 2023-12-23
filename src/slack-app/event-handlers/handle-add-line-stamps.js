const { saveLineStamps } = require("@utils/line-stamp-util");
const registerAllLineStampsToSlack = require("@slack-app/slack-api-client/register-slack-emoji");
const { convertResultsToString } = require("@utils/json-converter");
const {
  validateAddLineStampCommandArgs,
} = require("@utils/validator/command-args-validator");

/**
 * /add-line-stampコマンドを叩かれたら呼ばれる関数
 *
 * 1. 引数のチェック
 * 2. LINEスタンプを保存（スクレイピング）
 * 3. LINEスタンプをSlack絵文字として登録
 * 4. Slackに結果を投稿
 * @param {function} ack - コマンドを受け取ったことをSlackに返す関数
 * @param {object} command - Slackコマンド情報
 * @param {function} say - Slackに投稿する関数
 * @returns {void}
 */
async function handleAddLineStampCommand(ack, command, say) {
  console.log(
    "\n\n============================ handle Add Line Stamp Command ============================\n"
  );
  console.log(command);

  try {
    // コマンドを受け取ったことを確認
    await ack();

    // コマンドの引数をチェックして不適切だったらエラーメッセージを返す
    const error_message = validateAddLineStampCommandArgs(command);
    if (error_message) {
      await say(error_message);
      return;
    }

    // コマンドの引数をパース
    const [url, stamp_name] = command.text.split(" ");

    // LINEスタンプを保存
    const stamps_file_paths = await saveLineStamps(url, stamp_name);

    // LINEスタンプをSlack絵文字として登録
    const result = await registerLineStampsToSlack(
      stamp_name,
      stamps_file_paths
    );

    // Slackに結果を投稿
    await postResultToChannel(say, command, result);
  } catch (error) {
    // slack側にもエラーメッセージを投稿する
    sendErrorMessageToSlack(say, command, error);
  }
}

/**
 * LINEスタンプをSlack絵文字として登録する関数
 * @param {string} stampName - 登録する絵文字の名前
 * @param {string} stampsFilePaths - 保存したLINEスタンプのファイルパスのリスト
 * @returns {array<object>} - 絵文字の登録結果のリスト
 */
async function registerLineStampsToSlack(stampName, stampsFilePaths) {
  console.log("start register line stamps to slack");

  const result = await registerAllLineStampsToSlack(stampName, stampsFilePaths);

  console.log("end register line stamps to slack");
  return result;
}

/**
 * Slackに結果を投稿する関数
 * @param {function} say - Slackに投稿する関数
 * @param {object} command - Slackコマンド情報
 * @param {array<object>} results - 絵文字の登録結果
 * @returns {void}
 */
async function postResultToChannel(say, command, results) {
  console.log("start post results to channel");

  // Slackに投稿するメッセージ（1個目)
  const responseMessageList = getResponseMessageList(command, results);
  console.log(responseMessageList.join("\n"));
  const { ts } = await say(responseMessageList.join("\n"));

  // 続けてスレッドに（resultsをそのまま）投稿する。登録した絵文字を削除するときに使用。
  await say({
    text: "```" + convertResultsToString(results) + "```",
    thread_ts: ts,
  });

  console.log("end post result to channel");
}

/**
 * Slackに投稿するメッセージを生成して返却する関数
 * @param {object} command - Slackコマンド情報
 * @param {array<object>} results - 絵文字の登録結果
 * @returns {array<string>} - Slackに投稿するメッセージ
 */
function getResponseMessageList(command, results) {
  responseMessageList = [
    `\`${command["command"]} ${command["text"]}\``,
    "*=============== 結果 ===============*",
  ];
  for (const result of results) {
    if (result.ok) {
      responseMessageList.push(
        `:${result.name}: 登録成功 \`:${result.name}:\``
      );
    } else {
      const errorMessage =
        result.error === "error_name_taken"
          ? `すでに存在する絵文字名です`
          : result.error;

      responseMessageList.push(
        `:${result.name}: 登録失敗 (${errorMessage}) \`:${result.name}:\``
      );
    }
  }
  return responseMessageList;
}

/**
 * Slackにエラーメッセージを投稿する関数
 * @param {function} say - Slackに投稿する関数
 * @param {object} command - Slackコマンド情報
 * @param {object} error - エラー情報
 */
async function sendErrorMessageToSlack(say, command, error) {
  console.log("start send error message to slack");
  const { ts } = await say(
    `\`${command["command"]} ${command["text"]}\`` +
      "\n" +
      `予期せぬエラーが発生しました`
  );

  // エラーメッセージ(詳細)
  const errorMessage = [
    `*Error Occurred*`,
    `>${error.message}`,
    `>Stack Trace:`,
    `\`\`\`${error.stack}\`\`\``,
  ].join("\n");

  console.log(errorMessage);
  say({
    text: errorMessage,
    thread_ts: ts,
  });
  console.log("end send error message to slack");
}

module.exports = handleAddLineStampCommand;
