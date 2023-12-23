/**
 * 絵文字の登録結果のリストを文字列に変換する。
 * @param {object} results
 * @returns {string} - 絵文字の登録結果のリストを文字列に変換したもの
 */
function convertResultsToString(results) {
  return (
    "[\n" +
    results
      .map((result) => "\t" + convertObjectToOneLineString(result))
      .join(",\n") +
    "\n]"
  );
}

/**
 * オブジェクトを1行の文字列に変換する。
 * @param {object} obj - 文字列に変換したいオブジェクト
 * @returns {string} - 文字列に変換したオブジェクト
 */
function convertObjectToOneLineString(obj) {
  return (
    "{ " +
    Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key}: '${value}'`;
        }
        return `${key}: ${value}`;
      })
      .join(", ") +
    " }"
  );
}

module.exports = { convertResultsToString, convertObjectToOneLineString };
