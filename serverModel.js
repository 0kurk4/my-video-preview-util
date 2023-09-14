const STATUS_IDLE = 'STATUS_IDLE';
const STATUS_DIALOG = 'STATUS_DIALOG';
const STATUS_PROGRESS = 'STATUS_PROGRESS';
const STATUS_FINISHED_PREVIEW = 'STATUS_FINISHED_PREVIEW';
const STATUS_FINISHED_THUMBNAILS = 'STATUS_FINISHED_THUMBNAILS';
const STATUS_ERROR = 'STATUS_ERROR';

function ServerAppModel(status = STATUS_IDLE) {
    this.serverStatus = status;
    this.serverStatusDetail = undefined;
    this.sourceFilePath = undefined;
    this.sourceFileMetadata = undefined;
    this.previewFilePath = undefined;
    this.thumbnailsFilePath = undefined;
}

////////////////////////////////////////////////

ServerAppModel.prototype.status = function () {
    return this.serverStatus;
}

ServerAppModel.prototype.statusDetail = function () {
    return this.serverStatusDetail;
}

ServerAppModel.prototype.setIdle = function (detail = undefined) {
    this.serverStatus = STATUS_IDLE;
    this.serverStatusDetail = detail;
}

ServerAppModel.prototype.setProgress = function (detail = undefined) {
    this.serverStatus = STATUS_PROGRESS;
    this.serverStatusDetail = detail;
}

ServerAppModel.prototype.setDialog = function (detail = undefined) {
    this.serverStatus = STATUS_DIALOG;
    this.serverStatusDetail = detail;
}

ServerAppModel.prototype.setFinished = function (isPreview, detail = undefined) {
    this.serverStatus = isPreview ? STATUS_FINISHED_PREVIEW : STATUS_FINISHED_THUMBNAILS;
    this.serverStatusDetail = detail;
}

ServerAppModel.prototype.setError = function (detail = undefined) {
    this.serverStatus = STATUS_ERROR;
    this.serverStatusDetail = detail;
    // console.log(`set error ${detail}`);
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

ServerAppModel.prototype.thumbnailsPath = function () {
    return this.thumbnailsFilePath;
}

ServerAppModel.prototype.setThumbnailsPath = function (thumbnailsFilePath) {
    this.thumbnailsFilePath = thumbnailsFilePath;
}

////////////////////////////////////////////////


module.exports = {
    ServerAppModel,
    STATUS_IDLE,
    STATUS_DIALOG,
    STATUS_PROGRESS,
    STATUS_FINISHED_PREVIEW,
    STATUS_FINISHED_THUMBNAILS,
    STATUS_ERROR
}