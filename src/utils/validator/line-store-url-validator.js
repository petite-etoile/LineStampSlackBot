/**
 * LINE STOREのURLかどうかをチェックする。
 * @param {string} url - LINE STOREのURL
 * @returns {boolean} - LINE STOREのURLならTrue. そうでなければFalse.
 */
function isValidLineStoreUrl(url) {
  const pattern = /^https:\/\/store\.line\.me\/stickershop\/product\/[0-9]+/;
  return pattern.test(url);
}
module.exports = { isValidLineStoreUrl };
