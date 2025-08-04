const { imageHash } = require("image-hash");
const https = require("https");
const fs = require("fs");
const path = require("path");

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "temp.jpg");
    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(filePath));
        });
      })
      .on("error", (err) => reject(err));
  });
}

function getImageHash(filePath) {
  return new Promise((resolve, reject) => {
    imageHash(filePath, 16, true, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

module.exports = async function generateImageHash(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    return new Promise((resolve, reject) => {
      imageHash({ data: buffer }, 16, true, (error, hash) => {
        if (error) reject(error);
        else resolve(hash);
      });
    });
  } catch (err) {
    console.error("Error generating image hash:", err);
    throw err;
  }
};
