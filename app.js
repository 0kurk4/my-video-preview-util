const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const openDialog = require("./psScripts").openDialog;

// Setup Server app
const express = require('express');
const {
  PORT,
  MAIN_EP,
  GET_FILE_PATH_EP,
  GET_DIRECTORY_PATH_EP,
  SERVER_STATUS_EP,
  SERVER_STATUS_DETAIL_EP,
  GET_PREVIEW_EP,
  GET_METADATA_EP,
  SET_CLIENT_FINISH_EP
} = require('./serverAppCfg');
const serverApp = express();

// Setup Server model
const {
  ServerAppModel,
  STATUS_IDLE,
  STATUS_PROGRESS,
  STATUS_FINISHED
} = require('./serverModel');
const serverModel = new ServerAppModel();

// Import util functions
const {
  getFilePath,
  base64ToBytes,
  bytesToBase64,
  getVideoStreamFromMetadata,
  getPictureSize,
  getTimePosition
} = require('./utils');


// Map root folder
serverApp.use(express.static(__dirname + '/static'));

// Run server
serverApp.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});

// Server endpoints
//
// Main page (static HTML)
serverApp.get(MAIN_EP, function (req, res) {
  res.send('index.html');
});

// Invoke Select File dialog
serverApp.get(GET_FILE_PATH_EP, (req, res) => {
  console.log(`${GET_FILE_PATH_EP} endpoint`);
  serverModel.setDialog('Dialog is opened.');
  res.send(`Open file dialog on ${GET_FILE_PATH_EP}`);

  // Open system dialog
  openDialog(onFilePathResult, onFilePathError, 1);
  // DUMMY_onFilePathResult();
})

// Retrieve server status
serverApp.get(SERVER_STATUS_EP, (req, res) => {
  console.log(`${SERVER_STATUS_EP} endpoint`);
  res.send(serverModel.status());
});

// Retrieve server status detail
serverApp.get(SERVER_STATUS_DETAIL_EP, (req, res) => {
  console.log(`${SERVER_STATUS_DETAIL_EP} endpoint ` + serverModel.statusDetail());

  const base64 = bytesToBase64(new TextEncoder().encode(serverModel.statusDetail()));
  res.send(base64);
});

// Retrieve preview picture
serverApp.get(GET_PREVIEW_EP, (req, res) => {
  console.log(`${GET_PREVIEW_EP} endpoint`);

  const { width, height, duration } = getVideoStreamFromMetadata(serverModel.sourceMetadata());
  res.send({ duration, previewFilePath: serverModel.previewPath(), fileName: path.basename(serverModel.sourcePath()) });
});

// Retrieve metadata
serverApp.get(GET_METADATA_EP, (req, res) => {
  console.log(`${GET_METADATA_EP} endpoint`);

  const metadata = serverModel.sourceMetadata();
  const base64 = bytesToBase64(new TextEncoder().encode(JSON.stringify(metadata)));
  res.send(base64);
});

// Acknowledge client finished operation, set server ready for next process
serverApp.get(SET_CLIENT_FINISH_EP, (req, res) => {
  console.log(`${SET_CLIENT_FINISH_EP} endpoint`);
  res.end();

  serverModel.setIdle();
});


function checkFFMpeg() {
  ffmpeg.getAvailableFormats(function(err, formats) {
    if (err != null || formats === undefined) {
      console.log(err);
      serverModel.setError('ERROR! FFMpeg is not installed on this system.');
    }
  });
}
checkFFMpeg();


function onFilePathResult(data) {
  console.log(`onFilePathResult: ${data}`);
  console.log(data.length);
  if (data.length > 1) {
    serverModel.setProgress('Loading video metadata...');
    serverModel.setSourcePath(getFilePath(data));

    getFileMetadata();
  }
}

function onFilePathError(data) {
  const stringData = '' + data;
  console.log('onFilePathError: ' + stringData);
  if (stringData.indexOf('Get-File') === 0) {
    // Separate first line of error message
    let index = stringData.indexOf("\n");
    if (index === -1) index = undefined;
    serverModel.setError(stringData.substring(0, index));
  }
}

/*
function DUMMY_onFilePathResult() {
  serverModel.setSourcePath('C:/Users/Admin/Documents/expressapp/big_buck_bunny_480p_h264.mov');
  console.log('DUMMY_filepath> ' + serverModel.sourcePath());
  onFileMetadata();
}
*/




function getFileMetadata() {
  console.log(`getFileMetadata`);
  ffmpeg.ffprobe(serverModel.sourcePath(), function (err, metadata) {
    try {
      // console.dir(metadata);
      serverModel.setSourceMetadata(metadata);
      serverModel.setProgress('Video metadata loaded.');
      generatePreview();
    }
    catch (err) {
      // ERROR. Selected file is not supported.
      serverModel.setError(err);
      console.error('error> ' + err);
    }
    finally {
      console.log('getFileMetadata finaly');
    }
  });
}

function generatePreview() {
  const { width, height, duration } = getVideoStreamFromMetadata(serverModel.sourceMetadata());
  const timePosition = getTimePosition(duration);
  const size = getPictureSize(width, height);

  const proc = ffmpeg(serverModel.sourcePath())
    .on('filenames', function (fileNames) {
      console.log('Preview file name is ' + fileNames.join(''));
      serverModel.setPreviewPath(fileNames[0]);
    })
    .on('end', function () {
      console.log('Preview was saved');
      serverModel.setFinished('Preview is ready');
    })
    .on('error', function (err) {
      serverModel.setError(err.message);
      console.log('an error happened: ' + err.message);
    })
    .screenshots({ fastSeek: true, timemarks: [timePosition], size, filename: 'prev_%b', folder: './static/preview' });
}





