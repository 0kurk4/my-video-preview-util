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
  getFilePath
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
  serverModel.setDialog();
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
  console.log(`${SERVER_STATUS_DETAIL_EP} endpoint`);
  res.send(serverModel.statusDetail());
});

// Retrieve preview picture
serverApp.get(GET_PREVIEW_EP, (req, res) => {
  console.log(`${GET_PREVIEW_EP} endpoint`);

  const { width, height, duration } = serverModel.sourceMetadata()['streams'][0];
  res.send({ duration, previewFilePath: serverModel.previewPath(), fileName: path.basename(serverModel.sourcePath()) });
});

// Acknowledge client finished operation, set server ready for next process
serverApp.get(SET_CLIENT_FINISH_EP, (req, res) => {
  console.log(`${SET_CLIENT_FINISH_EP} endpoint`);
  res.end();

  serverModel.setIdle();
});



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
      generatePreview();
    }
    catch (err) {
      serverModel.setError(err);
      console.error('error> ' + err);
    }
    finally {
      console.log('fin');
    }
  });
}

function generatePreview() {
  console.dir('serverModel.getSourceFileMetadata()')
  const { width, height, duration } = serverModel.sourceMetadata()['streams'][0];
  const pictureWidth = 160;
  const pictureHeight = Math.round(pictureWidth * height / width);

  const timePosition = duration > 30 ? '00:00:15.000' : (duration > 2 ? '00:00:05.000' : '00:00:00.500');
  const size = `${pictureWidth}x${pictureHeight}`;

  const proc = ffmpeg(serverModel.sourcePath())
    .on('filenames', function (fileNames) {
      console.log('screenshots are ' + fileNames.join(', '));
      serverModel.setPreviewPath(fileNames[0])
    })
    .on('end', function () {
      console.log('screenshots were saved');
      serverModel.setFinished();
    })
    .on('error', function (err) {
      console.log('an error happened: ' + err.message);
    })
    .screenshots({ fastSeek: true, timemarks: [timePosition], size, filename: 'tn_%b', folder: './static/preview' });
}





