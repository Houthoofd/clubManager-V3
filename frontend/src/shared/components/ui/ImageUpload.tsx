import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  onImageSelected: (file: File | null) => void;
  currentImageUrl?: string | null;
  maxSizeMB?: number;
  className?: string;
  isUploading?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  currentImageUrl,
  maxSizeMB = 5,
  className = "",
  isUploading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Vérification du type
    if (!file.type.startsWith('image/')) {
      setError("Le fichier sélectionné n'est pas une image.");
      return;
    }

    // Vérification de la taille
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`L'image est trop lourde. La taille maximale est de ${maxSizeMB} Mo.`);
      return;
    }

    // Afficher un aperçu local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Envoyer au parent
    onImageSelected(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 
          ${isUploading ? 'opacity-50 cursor-not-allowed border-gray-300' : 
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/jpeg, image/png, image/webp, image/gif"
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative w-full aspect-square max-h-64 flex items-center justify-center overflow-hidden rounded-lg">
            <img src={preview} alt="Aperçu" className="max-w-full max-h-full object-contain" />
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-3">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">Cliquez</span> ou glissez une image ici
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP jusqu'à {maxSizeMB} Mo</p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
      
      {preview && !isUploading && (
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            onImageSelected(null);
          }} 
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 transition-colors block mx-auto"
        >
          Retirer l'image
        </button>
      )}
    </div>
  );
};
