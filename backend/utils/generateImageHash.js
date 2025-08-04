const { imageHash } = require("image-hash");
const https = require("https");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

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
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);

  return new Promise((resolve, reject) => {
    imageHash({ data: buffer }, 16, true, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

module.exports = async function generateImageHash(url) {
  const filePath = await downloadImage(url);
  const hash = await getImageHash(filePath);
  fs.unlinkSync(filePath);
  return hash;
};
