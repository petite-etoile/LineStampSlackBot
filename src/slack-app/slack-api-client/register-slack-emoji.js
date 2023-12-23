// 必要なライブラリの読み込み
const fs = require("fs");
const FormData = require("form-data");
const { default: axios } = require("axios");

// 自作モジュールの読み込み
const getCookieAndToken = require("@utils/slack-api-client/get-token-and-cookie");

// 環境変数の読み込み
require("dotenv").config();
const workspace = process.env.SLACK_WORKSPACE;

/**
 * LINEスタンプをSlack絵文字として登録する関数
 * @param {string} emojiNamePrefix - 絵文字の登録名のプレフィックス
 * @param {string} stampsFilePathList - LINEスタンプの画像ファイルのパスのリスト
 * @returns {Promise<object[]>} - 絵文字の登録結果のリスト
 */
async function registerAllLineStampsToSlack(
  emojiNamePrefix,
  stampsFilePathList
) {
  // POSTリクエストに必要なCookieとAPIトークンを取得
  const { cookie, token } = await getCookieAndToken();

  // 全ての絵文字の登録処理を並列で実行
  const registrationPromises = stampsFilePathList.map((stampsFilePath, idx) => {
    const emojiName = `${emojiNamePrefix}_${idx}`;

    return registerOneLineStampToSlack(
      emojiName,
      stampsFilePath,
      cookie,
      token
    );
  });

  // すべての絵文字の登録処理が終わるまで待機
  const results = await Promise.all(registrationPromises);
  console.log(results);
  return results;
}

/**
 * 1つのLINEスタンプをSlack絵文字として登録する関数
 * @param {string} emojiName - 絵文字の登録名
 * @param {string} stampsFilePath - LINEスタンプの画像ファイルのパス
 * @param {string} cookie - Cookie
 * @param {string} token - APIトークン
 * @returns {Promise<object>} - 絵文字の登録結果
 */
async function registerOneLineStampToSlack(
  emojiName,
  stampsFilePath,
  cookie,
  token
) {
  const url = `https://${workspace}.slack.com/api/emoji.add`;

  // FormData作成
  const formData = new FormData();
  const file = fs.createReadStream(stampsFilePath);
  formData.append("name", emojiName);
  formData.append("image", file);
  formData.append("token", token);
  formData.append("mode", "data");

  return axios
    .post(url, formData, {
      headers: {
        Cookie: cookie,
      },
    })
    .then((response) => {
      return { name: emojiName, ...response.data };
    })
    .catch((error) => {
      return { name: emojiName, error };
    });
}

module.exports = registerAllLineStampsToSlack;
