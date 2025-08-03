const sharp = require("sharp");
const axios = require("axios");
const { blockhashData } = require("blockhash-core");

async function fetchImageBuffer(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    return Buffer.from(response.data, "binary");
  } catch (error) {
    console.error("Failed to fetch image buffer:", error.message);
    throw new Error("Could not fetch image for hashing");
  }
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
