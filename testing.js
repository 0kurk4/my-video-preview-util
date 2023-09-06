var path = require('path');

function fileUrl(str) {
    if (typeof str !== 'string') {
        throw new Error('Expected a string');
    }
  
    var pathName = path.resolve(str).replace(/\\/g, '/');
  
    // Windows drive letter must be prefixed with a slash
    if (pathName[0] !== '/') {
        pathName = '/' + pathName;
    }
  
    return encodeURI('file://' + pathName);
  };
const str = 'C:\Users\Admin\Documents\expressapp\big_buck_bunny_480p_h264.mov';

  console.log('filepath ' + fileUrl(str));