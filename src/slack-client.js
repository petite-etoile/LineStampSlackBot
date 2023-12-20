const { Builder, By, Key, until } = require("selenium-webdriver");
require("dotenv").config();

async function signInToSlack() {
  let driver = await new Builder().forBrowser("chrome").build();

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

  console.log("OK");
}

signInToSlack();
