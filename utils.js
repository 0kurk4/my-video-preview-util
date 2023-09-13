const path = require('path');

const PICTURE_WIDTH = 160;

function getFilePath(data) {
  // Cast byte buffer into string
  const stringData = '' + data;
  // Sanitize string for back slashes
  const stringRaw = String.raw({ raw: [stringData] });
  // Resolve into valid Node.js path
  const filePath = path.resolve(stringRaw).replace(/\\/g, '/');

  return filePath;
};

// from https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join("");
  return btoa(binString);
}

// Assume we have one video stream per file
function getVideoStreamFromMetadata(metadata) {
  const { streams } = metadata;
  return streams.filter((stream) => stream['codec_type'] === 'video').shift();
}

function getPictureSize(width, height) {
  return `${PICTURE_WIDTH}x${Math.round(PICTURE_WIDTH * height / width)}`;
}

getTimePosition = duration => duration > 60 ? '00:00:30.000' : (duration > 2 ? '00:00:15.000' : '00:00:00.500');

module.exports = {
  getFilePath,
  base64ToBytes,
  bytesToBase64,
  getVideoStreamFromMetadata,
  getPictureSize,
  getTimePosition
}