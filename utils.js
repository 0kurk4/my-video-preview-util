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

  module.exports = {
    getFilePath
  }