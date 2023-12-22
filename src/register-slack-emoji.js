const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const FormData = require("form-data");
const { default: axios } = require("axios");

// 環境変数の読み込み
require("dotenv").config();
const workspace = process.env.SLACK_WORKSPACE;

async function registerAllLineStampsToSlack(
  emojiNamePrefix,
  stampsFilePathList
) {
  // Seleniumのドライバーをビルド
  const driver = await buildSeleniumDriver();

  let results = null;
  let cookie = null;
  let token = null;
  try {
    // サインイン
    await signInToSlack(driver);

    cookie = await getCookie(driver);
    token = await getToken(driver);
  } catch (error) {
    results = error;
  } finally {
    // ドライバーを終了
    await driver.quit();
  }

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
  results = await Promise.all(registrationPromises);
  console.log(results);
  return results;
}

// Seleniumのドライバーをビルドする関数
async function buildSeleniumDriver() {
  // ヘッドレスモードのオプションを設定
  const options = new chrome.Options();
  options.headless();

  // ヘッドレスモードでChromeを起動
  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

// Slackにサインインする関数
async function signInToSlack(driver) {
  console.log("Signing in to Slack...");

  // Slackにアクセス
  const workspace = process.env.SLACK_WORKSPACE;
  await driver.get(
    `https://${workspace}.slack.com/sign_in_with_password?redir=%2Fcustomize%2Femoji#/`
  );

  // ログイン処理
  await driver.findElement(By.id("email")).sendKeys(process.env.EMAIL);
  await driver
    .findElement(By.id("password"))
    .sendKeys(process.env.PASSWORD, Key.RETURN);

  // 'boot_data'を含むscriptタグが読みこまれるのを待機
  await driver.wait(
    until.elementLocated(By.xpath("//script[contains(text(), 'boot_data')]")),
    10000
  );

  // カスタム絵文字セクションが読み込まれるの待機
  await driver.wait(until.elementLocated(By.id("list_emoji_section")), 10000);

  console.log("completed sign in to Slack");
}

// Cookieを取得する関数
async function getCookie(driver) {
  const cookies = await driver.manage().getCookies();
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

// APIトークンを取得する関数
async function getToken(driver) {
  return driver.executeScript("return window.boot_data.api_token;");
}

// 1つのLINEスタンプをSlack絵文字として登録する関数
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
