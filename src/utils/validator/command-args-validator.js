const { isValidLineStoreUrl } = require("./line-store-url-validator");
const { isValidCharactersOfEmojiName } = require("./emoji-name-validator");

const USAGE_MESSAGE = `
\`\`\`
Usage: 
    /add-line-stamp [LINE STOREのURL] [登録絵文字名]

Args:
    期待しているURLの形式: https://store.line.me/stickershop/product/[0-9]+
    登録絵文字名: 小文字、数字、'-'、'_'、全角文字（ひらがな、カタカナ、漢字）からなる20文字以下の文字列.

Example: 
    /add-line-stamp https://store.line.me/stickershop/product/24945321/ja lovot1
\`\`\`
`;

/**
 * add-line-stampコマンドの引数をチェックする。
 * @param {object} command - Slackコマンド情報
 * @returns {string} - Slackに投稿するエラーメッセージ
 */
function validateAddLineStampCommandArgs(command) {
  let errorMessages = [];

  const message = command.text;
  // 全角スペースをすべて半角スペースに変換してからスペースで分割
  const args = message.replace(/\u3000/g, " ").split(" ");

  if (args.length !== 2) {
    errorMessages.push("- コマンドの引数は2つにしてください。");
  }

  if (!isValidLineStoreUrl(args[0])) {
    errorMessages.push("- 第一引数がLINE STOREのURLではありません。");
  }

  if (args.length > 1) {
    if (args[1].length > 20) {
      errorMessages.push(
        "- 登録絵文字名は20文字以下にしてください。(誤操作で長くなっちゃったと思っています)"
      );
    }

    if (isValidCharactersOfEmojiName(args[1]) === false) {
      errorMessages.push(
        "- 登録絵文字名は小文字、数字、`-`、`_`、全角文字（ひらがな、カタカナ、漢字）以外使えません。たぶん。"
      );
    }
  }

  if (errorMessages.length) {
    errorMessages = [
      `\`/add-line-stamp ${message}\``,
      "",
      ...errorMessages,
      "",
      USAGE_MESSAGE,
    ];
  }

  return errorMessages.join("\n");
}

module.exports = { validateAddLineStampCommandArgs };
