const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

// LINEスタンプを保存する関数
async function saveLineStamps(lineStoreUrl, stampName = "line_stamp") {
  // 保存先ディレクトリ
  const IMAGE_DIR = "images";

  // LINEスタンプのURLを取得
  const lineStampUrls = await getLineStampUrls(lineStoreUrl);

  // LINEスタンプを保存
  const imagesFilePaths = [];
  for (const [idx, stampImageUrl] of lineStampUrls.entries()) {
    const filePath = path.join(
      IMAGE_DIR,
      `${stampName}${idx.toString().padStart(2, "0")}.png`
    );
    await downloadImage(stampImageUrl, filePath);
    imagesFilePaths.push(filePath);
  }

  return imagesFilePaths;
}

// LINEスタンプのURLを取得する関数
async function getLineStampUrls(lineStoreUrl) {
  const response = await axios.get(lineStoreUrl);
  const html = response.data;
  const $ = cheerio.load(html);

  const lineStampUrls = [];
  $("span.mdCMN09Image").each((_, element) => {
    const style = $(element).attr("style");
    const match = style?.match(/url\((.*?)\);/);
    if (match) {
      lineStampUrls.push(match[1]);
    }
  });

  return Array.from(new Set(lineStampUrls)).sort();
}

// 画像をダウンロードする関数
async function downloadImage(imageUrl, imageSavePath) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(imageSavePath, response.data);
}

module.exports = { saveLineStamps };
