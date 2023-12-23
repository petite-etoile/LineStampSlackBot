const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// 環境変数の読み込み
require("dotenv").config();
const workspace = process.env.SLACK_WORKSPACE;
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

/**
 * Seleniumを使ってサインインしてCookieとAPIトークンを取得する関数.
 * @returns {Promise<object>} - CookieとAPIトークン
 */
async function getCookieAndToken() {
  // Seleniumのドライバーをビルド
  const driver = await buildSeleniumDriver();

  try {
    // サインイン
    await signInToSlack(driver);

    cookie = await getCookie(driver);
    token = await getToken(driver);
  } finally {
    // ドライバーを終了
    await driver.quit();
  }
  return { cookie, token };
}

/**
 * Seleniumのドライバーをビルドする関数
 * @returns {WebDriver} - Seleniumのドライバー
 */
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

/**
 * Slackにサインインする関数
 * @param {WebDriver} driver - Seleniumのドライバー
 * @returns {Promise<void>} - Promise
 */
async function signInToSlack(driver) {
  console.log("Signing in to Slack...");

  // Slackにアクセス
  await driver.get(
    `https://${workspace}.slack.com/sign_in_with_password?redir=%2Fcustomize%2Femoji#/`
  );

  // ログイン処理
  await driver.findElement(By.id("email")).sendKeys(email);
  await driver.findElement(By.id("password")).sendKeys(password, Key.RETURN);

  // 'boot_data'を含むscriptタグが読みこまれるのを待機 (api-tokenを取得するのに必要)
  await driver.wait(
    until.elementLocated(By.xpath("//script[contains(text(), 'boot_data')]")),
    10000
  );

  // カスタム絵文字セクションが読み込まれるの待機
  await driver.wait(until.elementLocated(By.id("list_emoji_section")), 10000);

  console.log("completed sign in to Slack");
}

/**
 * Cookieを取得する関数
 * @param {WebDriver} driver - Seleniumのドライバー
 * @returns {Promise<string>} - Cookie
 */
async function getCookie(driver) {
  const cookies = await driver.manage().getCookies();
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

/**
 * APIトークンを取得する関数
 * @param {WebDriver} driver - Seleniumのドライバー
 * @returns {Promise<string>} - APIトークン
 */
async function getToken(driver) {
  return driver.executeScript("return window.boot_data.api_token;");
}

module.exports = getCookieAndToken;
