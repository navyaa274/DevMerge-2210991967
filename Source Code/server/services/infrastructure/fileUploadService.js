const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

class FileUploadService {
  constructor() {
    this.allowedImageTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    this.allowedDocumentTypes = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
    ];
    this.allowedVideoTypes = [".mp4", ".webm", ".mov"];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  generateFileName(originalName) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString("hex");
    return `${timestamp}-${random}${ext}`;
  }

  validateFile(fileName, mimeType) {
    const ext = path.extname(fileName).toLowerCase();

    const isImage = this.allowedImageTypes.includes(ext);
    const isDocument = this.allowedDocumentTypes.includes(ext);
    const isVideo = this.allowedVideoTypes.includes(ext);

    if (!isImage && !isDocument && !isVideo) {
      throw new Error(`File type ${ext} is not allowed`);
    }

    return { isImage, isDocument, isVideo, type: ext };
  }

  async uploadFile(file, destination) {
    const { validateFile, generateFileName, maxFileSize } = this;

    if (file.size > maxFileSize) {
      throw new Error("File size exceeds maximum allowed size");
    }

    const fileInfo = validateFile(file.originalname, file.mimetype);
    const fileName = generateFileName(file.originalname);
    const uploadPath = path.join(destination, fileName);

    await fs.mkdir(destination, { recursive: true });
    await fs.writeFile(uploadPath, file.buffer);

    return {
      filename: fileName,
      originalName: file.originalname,
      path: uploadPath,
      size: file.size,
      mimeType: file.mimetype,
      type: fileInfo.type,
    };
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  async getFileInfo(filePath) {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  }
}

module.exports = new FileUploadService();
