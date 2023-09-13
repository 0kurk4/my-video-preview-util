const STATUS_IDLE = 'STATUS_IDLE';
const STATUS_DIALOG = 'STATUS_DIALOG';
const STATUS_PROGRESS = 'STATUS_PROGRESS';
const STATUS_FINISHED = 'STATUS_FINISHED';
const STATUS_ERROR = 'STATUS_ERROR';

function ServerAppModel(status = STATUS_IDLE) {
    this.serverStatus = status;
    this.serverStatusDetail = undefined;
    this.sourceFilePath = undefined;
    this.sourceFileMetadata = undefined;
    this.previewFilePath = undefined;
}

////////////////////////////////////////////////

ServerAppModel.prototype.status = function () {
    return this.serverStatus;
}

ServerAppModel.prototype.statusDetail = function () {
    return this.serverStatusDetail;
}

ServerAppModel.prototype.setIdle = function () {
    this.serverStatus = STATUS_IDLE;
    this.serverStatusDetail = undefined;
}

ServerAppModel.prototype.setProgress = function (progress = undefined) {
    this.serverStatus = STATUS_PROGRESS;
    this.serverStatusDetail = progress;
}

ServerAppModel.prototype.setDialog = function () {
    this.serverStatus = STATUS_DIALOG;
    this.serverStatusDetail = undefined;
}

ServerAppModel.prototype.setFinished = function () {
    this.serverStatus = STATUS_FINISHED;
    this.serverStatusDetail = undefined;
}

ServerAppModel.prototype.setError = function (err) {
    this.serverStatus = STATUS_ERROR;
    this.serverStatusDetail = err;
    console.log('this.serverStatusDetail');
    console.log(this.serverStatusDetail);
}

////////////////////////////////////////////////

ServerAppModel.prototype.sourcePath = function () {
    return this.sourceFilePath;
}

ServerAppModel.prototype.setSourcePath = function (sourceFilePath) {
    this.sourceFilePath = sourceFilePath;
}

ServerAppModel.prototype.sourceMetadata = function () {
    return this.sourceFileMetadata;
}

ServerAppModel.prototype.setSourceMetadata = function (sourceFileMetadata) {
    this.sourceFileMetadata = sourceFileMetadata;
}

////////////////////////////////////////////////

ServerAppModel.prototype.previewPath = function () {
    return this.previewFilePath;
}

ServerAppModel.prototype.setPreviewPath = function (previewFilePath) {
    this.previewFilePath = previewFilePath;
}

////////////////////////////////////////////////


module.exports = {
    ServerAppModel,
    STATUS_IDLE,
    STATUS_DIALOG,
    STATUS_PROGRESS,
    STATUS_FINISHED,
    STATUS_ERROR
}