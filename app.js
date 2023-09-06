const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const openDialog = require("./psScripts").openDialog;

// Setup Server app
const express = require('express');
const serverApp = express();
const {
  PORT,
  MAIN_PATH_EP,
  GET_FILE_PATH_EP,
  GET_DIRECTORY_PATH_EP,
  PROGRESS_EP,
  GET_PREVIEW
} = require('./serverAppCfg');



serverApp.use(express.static(__dirname + '/static'));

serverApp.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});

// Main page
serverApp.get(MAIN_PATH_EP, function(req, res) {
  res.send('index.html');
});

let FilePath;
let FileMetadata;
let PreviewFilePath;
let PreviewFileProgress;

async function onFilePathResult(data) {
    console.log('testResutFunction: ' + data);
    console.log(data.length);
    if (data.length > 1) {
      FilePath = getFilePath(data);
      console.log('filepath> ' + FilePath);
      onFileMetadata(FilePath);
    }
}

function DUMMY_onFilePathResult() {
    FilePath = 'C:/Users/Admin/Documents/expressapp/big_buck_bunny_480p_h264.mov';
    console.log('DUMMY_filepath> ' + FilePath);
    onFileMetadata(FilePath);
}

function onFilePathError(data) {
    console.log('testErrorFunction: ' + data);
}

serverApp.get(GET_FILE_PATH_EP, (req, res) => {
    console.log(`${GET_FILE_PATH_EP} endpoint`);
    PreviewFileProgress = 'PROGRESS';
    // console.log(req)
    res.send('response is sent');
    //res.end()
    openDialog(onFilePathResult, onFilePathError, 1);
    // DUMMY_onFilePathResult();
  })

serverApp.get(PROGRESS_EP, (req, res) => {
  console.log(`${PROGRESS_EP} endpoint`);
  res.send(PreviewFileProgress);
});

serverApp.get(GET_PREVIEW, (req, res) => {
  console.log(`${GET_PREVIEW} endpoint`);

  const { width, height, duration } = FileMetadata['streams'][0];
  res.send({duration, previewFilePath: PreviewFilePath[0], fileName: path.basename(FilePath)});
});


function onFileMetadata(filepath) {
  console.log('filepath ' + filepath);
  ffmpeg.ffprobe(filepath, function (err, metadata) {
    console.log(filepath);
    try {
      // console.dir(metadata);
      FileMetadata = metadata;
      generatePreview();
    }
    catch (err) {
      console.error('error> ' + err);
    }
    finally {
      console.log('fin');
    }
  });
}

function getFilePath(data) {
  // Cast byte buffer into string
  const stringData = '' + data;
  // Sanitize string for back slashes
  const stringRaw = String.raw({ raw: [stringData] });
  // Resolve into valid Node.js path
  const filePath = path.resolve(stringRaw).replace(/\\/g, '/');

  return filePath;
};

function generatePreview() {
  //console.log(FilePath);
  //console.log(FileMetadata);

  const { width, height, duration } = FileMetadata['streams'][0];
  const pictureWidth = 160;
  const pictureHeight = Math.round(pictureWidth * height / width);

  const timePosition = duration > 30 ? '00:00:10.000' : (duration > 2 ? '00:00:01.000' : '00:00:00.500');
  const size = `${pictureWidth}x${pictureHeight}`;

  const proc = ffmpeg(FilePath)
  .on('filenames', function(filenames) {
    console.log('screenshots are ' + filenames.join(', '));
    PreviewFilePath = filenames;
  })
  .on('end', function() {
    console.log('screenshots were saved');
    PreviewFileProgress = 'FINISHED';
  })
  .on('error', function(err) {
    console.log('an error happened: ' + err.message);
  })
  .screenshots({ fastSeek: true, timemarks: [ timePosition ], size, filename: 'tn_%b', folder: './static/preview'});
}





