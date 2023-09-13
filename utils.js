const path = require('path');

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

module.exports = {
  getFilePath,
  base64ToBytes,
  bytesToBase64
}