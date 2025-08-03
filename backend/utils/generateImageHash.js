const sharp = require("sharp");
const axios = require("axios");
const { blockhashData } = require("blockhash-core");

async function fetchImageBuffer(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
}

async function generateImageHash(imageUrl) {
  const imageBuffer = await fetchImageBuffer(imageUrl);

  const raw = await sharp(imageBuffer)
    .resize(256, 256, { fit: "cover" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hash = blockhashData(raw.data, 8, 2, raw.info.width, raw.info.height);
  return hash;
}

module.exports = generateImageHash;
