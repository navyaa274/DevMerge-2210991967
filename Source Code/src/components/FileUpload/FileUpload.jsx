import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const FileUpload = ({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = '*',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  uploadUrl = '/api/upload'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    if (acceptedTypes !== '*' && !acceptedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not accepted`);
    }

    return true;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (!multiple && files.length > 1) {
      onUploadError?.(new Error('Multiple files not allowed'));
      return;
    }

    const validFiles = [];
    for (const file of files) {
      try {
        validateFile(file);
        validFiles.push(file);
      } catch (error) {
        onUploadError?.(error);
        return;
      }
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadPromises = validFiles.map(uploadFile);
      const results = await Promise.all(uploadPromises);

      setUploadedFiles(prev => [...prev, ...results]);
      onUploadSuccess?.(results);
    } catch (error) {
      onUploadError?.(error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [multiple, maxSize, acceptedTypes, uploadUrl, onUploadSuccess, onUploadError]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!multiple && files.length > 1) {
      onUploadError?.(new Error('Multiple files not allowed'));
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadPromises = files.map(uploadFile);
      const results = await Promise.all(uploadPromises);

      setUploadedFiles(prev => [...prev, ...results]);
      onUploadSuccess?.(results);
    } catch (error) {
      onUploadError?.(error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="file-upload">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-gray-600">Uploading... {progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-6xl text-gray-400 mb-4">📁</div>
            <div className="text-xl font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </div>
            <div className="text-gray-500 mb-4">
              {multiple ? 'Multiple files allowed' : 'Single file only'} • Max {maxSize / (1024 * 1024)}MB • {acceptedTypes === '*' ? 'All types' : acceptedTypes}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose Files
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{file.originalName || file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {uploadedFiles.some(file => file.error) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm">
            Some files failed to upload. Please check file size and type restrictions.
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
