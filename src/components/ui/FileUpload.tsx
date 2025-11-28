import { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, Loader } from 'lucide-react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface FileUploadProps {
  onUploadComplete: (downloadURL: string, storagePath: string, fileName: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
  label?: string;
  disabled?: boolean;
}

export function FileUpload({
  onUploadComplete,
  onError,
  accept = '*/*',
  maxSizeMB = 50,
  folder = 'uploads',
  label = 'Upload de Arquivo',
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      onError?.(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    try {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const storagePath = `${folder}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          onError?.(error.message || 'Erro ao fazer upload');
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          setUploadComplete(true);
          onUploadComplete(downloadURL, storagePath, selectedFile.name);
        }
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      onError?.(error.message || 'Erro ao fazer upload');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setProgress(0);
    setUploadComplete(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      {!selectedFile ? (
        <div className="relative">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className={`border-2 border-dashed border-gray-700 rounded-lg p-6 text-center transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-secondary cursor-pointer'
          }`}>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Clique para selecionar ou arraste o arquivo
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Tamanho máximo: {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-yellow-500 rounded-lg flex items-center justify-center">
                {uploadComplete ? (
                  <CheckCircle className="w-5 h-5 text-black" />
                ) : uploading ? (
                  <Loader className="w-5 h-5 text-black animate-spin" />
                ) : (
                  <File className="w-5 h-5 text-black" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && !uploadComplete && (
              <button
                onClick={handleRemove}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-yellow-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center">{progress}% enviado</p>
            </div>
          )}

          {uploadComplete && (
            <div className="flex items-center justify-center gap-2 text-green-500 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Upload concluído com sucesso!</span>
            </div>
          )}

          {!uploadComplete && !uploading && (
            <button
              onClick={handleUpload}
              className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-secondary to-yellow-500 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Fazer Upload
            </button>
          )}
        </div>
      )}
    </div>
  );
}
