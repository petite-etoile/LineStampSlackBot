const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("path");
require("dotenv").config();

const uploadFormId = "petit_upload_form";
const workspace = process.env.SLACK_WORKSPACE;

async function registerAllLineStampsToSlack(
  emojiNamePrefix,
  stampsFilePathList
) {
  // Seleniumのドライバーをビルド
  const driver = await buildSeleniumDriver();

  let results = null;
  try {
    // サインイン
    await signInToSlack(driver);

    // アップロード用のフォーム挿入
    await insertUploadForm(driver);

    // 全ての絵文字の登録処理を並列で実行
    const registrationPromises = stampsFilePathList.map(
      (stampsFilePath, idx) => {
        const emojiName = `${emojiNamePrefix}_${idx}`;
        const stampsAbsoluteFilePath = path.resolve(stampsFilePath);

        return registerOneLineStampToSlack(
          emojiName,
          stampsAbsoluteFilePath,
          driver
        );
      }
    );
    // すべての絵文字の登録処理が終わるまで待機
    results = await Promise.all(registrationPromises);
    console.log(results);
  } catch (error) {
    results = error;
  } finally {
    // ドライバーを終了
    await driver.quit();
  }
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

// ページにアップロード用のフォームを挿入する関数
async function insertUploadForm(driver) {
  console.log("Inserting upload form...");

  // ページにフォームを挿入するスクリプト
  const insertUploadFormScript = `
    const uploadFormId = "${uploadFormId}";
    const form = document.createElement('form');
    const token = window.boot_data.api_token;
    
    form.id = uploadFormId;
    form.innerHTML = \`
        <input id="petit_emoji_name_input" name="name">
        <input type="file" id="petit_emoji_file_input" name="image">
        <input type="hidden" id="petit_token_input" name="token" value="\${token}">
        <input type="hidden" id="petit_mode_input" name="mode" value="data">
    \`;
    document.body.append(form);
  `;

  await driver.executeScript(insertUploadFormScript);

  console.log("completed insert upload form");
}

// 1つのLINEスタンプをSlack絵文字として登録する関数
async function registerOneLineStampToSlack(emojiName, stampsFilePath, driver) {
  // ファイルパスと絵文字名の設定
  const fileInput = await driver.findElement(By.id("petit_emoji_file_input"));
  const emojiNameInput = await driver.findElement(
    By.id("petit_emoji_name_input")
  );

  // フォームに値を入力
  await fileInput.sendKeys(stampsFilePath);
  await emojiNameInput.sendKeys(emojiName);

  // フォームを送信するスクリプト
  const script = `
    const workspace = '${workspace}';
    const form = document.querySelector('#${uploadFormId}');
    const formData = new FormData(form);

    const response_json = await fetch(\`https://\${workspace}.slack.com/api/emoji.add\`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
      .then(response => {
        console.log(response);
        return response.json();
      })
      .then(data => arguments[arguments.length-1](data)) // コールバック関数を実行して終了したことを伝える
      .catch(error => arguments[arguments.length-1]({ error: error.toString() }));
  `;

  const result = await driver.executeAsyncScript(script);
  console.log(
    `----------------------------------------------------------------
result of registering :${emojiName}:
${JSON.stringify(result, null, 2)}
----------------------------------------------------------------`
  );
  return result;
}

registerAllLineStampsToSlack("TEST", ["images/TEST00.png"]);

module.exports = registerAllLineStampsToSlack;
