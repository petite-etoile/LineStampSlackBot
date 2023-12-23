/**
 * 登録しようとしている絵文字の名前が正しい形式かどうかをチェックする。
 * ※ 小文字、数字、'-'、'_'、全角文字（\u3040-\u30FFは全角ひらがなとカタカナ、\u3400-\u4DBFは漢字）のみを許可する。
 *
 * @param {string} name - 絵文字の名前
 * @returns {boolean} - 絵文字の名前が正しい形式ならTrue. そうでなければFalse.
 */
function isValidCharactersOfEmojiName(name) {
  // 小文字、数字、'-'、'_'、全角文字（\u3040-\u30FFは全角ひらがなとカタカナ、\u3400-\u4DBFは漢字）を許可
  const pattern = /^[a-z0-9\-_\u3040-\u30FF\u3400-\u4DBF]+$/;
  return pattern.test(name);
}

module.exports = { isValidCharactersOfEmojiName };
