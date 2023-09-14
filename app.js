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
  GENERATE_THUMBNAILS_EP,
  GET_PREVIEW_EP,
  GET_THUMBNAILS_EP,
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


serverApp.use(express.json()) // for parsing application/json

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

// Generate $count of thumbnails
serverApp.post(GENERATE_THUMBNAILS_EP, (req, res) => {
  console.log(`${GENERATE_THUMBNAILS_EP} endpoint`);

  const count = req.body.count;
  res.send(`THUMBNAILS ENDPOINT will generate ${count} thumbs`);

  serverModel.setProgress('Preparing thumbnails...');
  generateThumbnails(count);
});

// Retrieve preview picture
serverApp.get(GET_PREVIEW_EP, (req, res) => {
  console.log(`${GET_PREVIEW_EP} endpoint`);

  const { duration } = getVideoStreamFromMetadata(serverModel.sourceMetadata());
  res.send({ duration, previewFilePath: serverModel.previewPath(), fileName: path.basename(serverModel.sourcePath()) });
});

// Retrieve metadata
serverApp.get(GET_METADATA_EP, (req, res) => {
  console.log(`${GET_METADATA_EP} endpoint`);

  const metadata = serverModel.sourceMetadata();
  const base64 = bytesToBase64(new TextEncoder().encode(JSON.stringify(metadata)));
  res.send(base64);
});

// Retrieve thumbnails
serverApp.get(GET_THUMBNAILS_EP, (req, res) => {
  console.log(`${GET_THUMBNAILS_EP} endpoint`);

  const metadata = serverModel.thumbnailsPath();
  const base64 = bytesToBase64(new TextEncoder().encode(JSON.stringify(metadata)));
  res.send({ thumbnailsFilePath: serverModel.thumbnailsPath() });
});

// Acknowledge client finished operation, set server ready for next process
serverApp.get(SET_CLIENT_FINISH_EP, (req, res) => {
  console.log(`${SET_CLIENT_FINISH_EP} endpoint`);
  res.end();

  serverModel.setIdle();
});


function checkFFMpeg() {
  ffmpeg.getAvailableFormats(function (err, formats) {
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
  serverModel.setSourcePath('C:/Users/Admin/Documents/ffmpeg/big_buck_bunny_480p_h264.mov');
  console.log('DUMMY_filepath> ' + serverModel.sourcePath());
  getFileMetadata();
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
      // console.log('getFileMetadata finaly');
    }
  });
}

function generatePreview() {
  const { width, height, duration } = getVideoStreamFromMetadata(serverModel.sourceMetadata());
  const timePosition = getTimePosition(duration);
  const size = getPictureSize(width, height);

  const config = {
    fastSeek: true,
    size,
    folder: './static/preview',
    filename: `prev_%b`,
    timemarks: [timePosition]
  }

  getScreenshots(previewFilenamesHandler,
    previewErrorHandler,
    previewEndHandler,
    serverModel.sourcePath(),
    config);
}

function previewFilenamesHandler(fileNames) {
  console.log('Preview file name is ' + fileNames[0]);
  serverModel.setPreviewPath(fileNames[0]);
}

function previewErrorHandler(err) {
  console.log('an previewErrorHandler happened: ' + err.message);
  serverModel.setError(err.message);
}

function previewEndHandler() {
  console.log('Preview was saved');
  serverModel.setFinished(true, 'Preview is ready');
}



function generateThumbnails(count) {
  const { width, height } = getVideoStreamFromMetadata(serverModel.sourceMetadata());
  const size = getPictureSize(width, height);

  const config = {
    fastSeek: false,
    size,
    folder: './static/thumbnails',
    filename: `thumb_%b`,
    count
  }

  getScreenshots(thumbnailsFilenamesHandler,
    thumbnailsErrorHandler,
    thumbnailsEndHandler,
    serverModel.sourcePath(),
    config);
}

function thumbnailsFilenamesHandler(fileNames) {
  console.log('Thumbnails are ' + fileNames.join(', '));
  serverModel.setThumbnailsPath(fileNames);
}

function thumbnailsErrorHandler(err) {
  console.log('an thumbnailsErrorHandler happened: ' + err.message);
  serverModel.setError(err.message);
}

function thumbnailsEndHandler() {
  console.log('Thumbnails were saved');
  serverModel.setFinished(false, 'Thumbnails are ready');
}



function getScreenshots(onFileNames, onError, onEnd, sourcePath, config) {
  console.log(`getScreenshots\n${JSON.stringify(config)}\n`);

  const proc = ffmpeg(sourcePath)
    .on('filenames', onFileNames)
    .on('end', onEnd)
    .on('error', onError)
    .screenshots(config);
}


