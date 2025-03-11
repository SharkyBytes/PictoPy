import React, { useState, useCallback } from 'react';
import { Upload, Download, Trash2, RefreshCw } from 'lucide-react';

// Define the CompressedImage interface
interface CompressedImage {
  id: string;
  originalFile: File;
  originalSize: number;
  compressedSize: number;
  compressedBlob: Blob;
  previewUrl: string;
}

const ImageCompressor: React.FC = () => {
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>(
    [],
  );
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionLevel, setCompressionLevel] = useState<number>(0.7);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);

  /**
   * Compresses an image file.
   * @param file - The image file to compress.
   * @returns A promise that resolves to the compressed image object.
   */
  const compressImage = useCallback(
    async (file: File): Promise<CompressedImage> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject('Failed to get canvas context');
              return;
            }

            let width = img.width;
            let height = img.height;

            // Adjust dimensions to fit within maxWidth and maxHeight
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            // Convert canvas to Blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedImage: CompressedImage = {
                    id: Math.random().toString(36).substring(2, 9),
                    originalFile: file,
                    originalSize: file.size,
                    compressedSize: blob.size,
                    compressedBlob: blob,
                    previewUrl: URL.createObjectURL(blob),
                  };
                  resolve(compressedImage);
                } else {
                  reject('Failed to compress image');
                }
              },
              'image/jpeg',
              compressionLevel,
            );
          };
          img.onerror = () => reject('Image load failed');
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject('File reading failed');
        reader.readAsDataURL(file);
      });
    },
    [compressionLevel, maxWidth, maxHeight],
  );

  /**
   * Handles file upload and compresses the selected images.
   * @param event - The file input change event.
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsCompressing(true);
      try {
        const compressedFiles = await Promise.all(
          Array.from(files).map((file) =>
            compressImage(file).catch((err) => {
              console.error('Compression failed:', err);
              return null;
            }),
          ),
        );
        setCompressedImages((prev) => [
          ...prev,
          ...compressedFiles.filter(
            (file): file is CompressedImage => file !== null,
          ),
        ]);
      } catch (error) {
        console.error('Error compressing images:', error);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  /**
   * Handles downloading a compressed image.
   * @param image - The compressed image to download.
   */
  const handleDownload = (image: CompressedImage) => {
    const url = URL.createObjectURL(image.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${image.originalFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Handles removing a compressed image from the list.
   * @param id - The ID of the compressed image to remove.
   */
  const handleRemove = (id: string) => {
    setCompressedImages((prev) => prev.filter((img) => img.id !== id));
  };

  /**
   * Handles recompressing an image.
   * @param image - The compressed image to recompress.
   */
  const handleRecompress = async (image: CompressedImage) => {
    setIsCompressing(true);
    try {
      const recompressedImage = await compressImage(image.originalFile);
      setCompressedImages((prev) =>
        prev.map((img) => (img.id === image.id ? recompressedImage : img)),
      );
    } catch (error) {
      console.error('Error recompressing image:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="rounded-xl bg-white/80 backdrop-blur-sm p-6 shadow-lg dark:bg-gray-800/80">
      <h3 className="mb-6 text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Image Compressor</h3>
      
      <div className="mb-6 space-y-4">
        {/* Compression Level Slider */}
        <div className="bg-white/50 rounded-lg p-4 shadow-sm dark:bg-gray-700/50">
          <label
            htmlFor="compression-level"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Compression Level: <span className="text-blue-600 font-semibold">{compressionLevel}</span>
          </label>
          <input
            type="range"
            id="compression-level"
            min="0.1"
            max="1"
            step="0.1"
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:bg-gray-600"
          />
        </div>

        {/* Max Width Slider */}
        <div className="bg-white/50 rounded-lg p-4 shadow-sm dark:bg-gray-700/50">
          <label
            htmlFor="max-width"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Max Width: <span className="text-blue-600 font-semibold">{maxWidth}px</span>
          </label>
          <input
            type="range"
            id="max-width"
            min="100"
            max="3840"
            step="100"
            value={maxWidth}
            onChange={(e) => setMaxWidth(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:bg-gray-600"
          />
        </div>

        {/* Max Height Slider */}
        <div className="bg-white/50 rounded-lg p-4 shadow-sm dark:bg-gray-700/50">
          <label
            htmlFor="max-height"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Max Height: <span className="text-blue-600 font-semibold">{maxHeight}px</span>
          </label>
          <input
            type="range"
            id="max-height"
            min="100"
            max="2160"
            step="100"
            value={maxHeight}
            onChange={(e) => setMaxHeight(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:bg-gray-600"
          />
        </div>
      </div>

      {/* File Upload Button */}
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="rounded-lg inline-flex cursor-pointer items-center bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <Upload className="mr-2" size={18} />
          Upload Images
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Compressing Indicator */}
      {isCompressing && (
        <div className="flex items-center justify-center mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="mr-3 h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Compressing images...</p>
        </div>
      )}

      {/* Compressed Images List */}
      <ul className="space-y-6">
        {compressedImages.map((image) => (
          <li 
            key={image.id} 
            className="rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-5 shadow-md transition-all duration-300 hover:shadow-lg dark:from-gray-800/70 dark:to-gray-900/70"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="mr-2 flex-grow truncate text-sm font-medium">
                {image.originalFile.name}
              </span>
              <div className="flex space-x-3">
                {/* Download Button */}
                <button
                  onClick={() => handleDownload(image)}
                  className="rounded-full p-2 text-blue-500 bg-blue-50 transition-all duration-300 hover:text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                  title="Download compressed image"
                >
                  <Download size={18} />
                </button>

                {/* Recompress Button */}
                <button
                  onClick={() => handleRecompress(image)}
                  className="rounded-full p-2 text-green-500 bg-green-50 transition-all duration-300 hover:text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                  title="Recompress image"
                >
                  <RefreshCw size={18} />
                </button>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(image.id)}
                  className="rounded-full p-2 text-red-500 bg-red-50 transition-all duration-300 hover:text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                  title="Remove image"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Image Preview and Details */}
            <div className="flex items-center space-x-6">
              <div className="rounded-lg overflow-hidden shadow-md h-24 w-24 border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105">
                <img
                  src={image.previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 bg-white/50 p-3 rounded-lg shadow-sm dark:bg-gray-800/50">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Original:</span>
                    <span className="ml-2 font-medium">{(image.originalSize / 1024).toFixed(2)} KB</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Compressed:</span>
                    <span className="ml-2 font-medium">{(image.compressedSize / 1024).toFixed(2)} KB</span>
                  </p>
                </div>
                <div className="mt-1 bg-green-50 p-2 rounded-md dark:bg-green-900/20">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Saved {((image.originalSize - image.compressedSize) / 1024).toFixed(2)} KB
                    <span className="ml-1 inline-block px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-800/40 dark:text-green-300">
                      {(((image.originalSize - image.compressedSize) / image.originalSize) * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageCompressor;
