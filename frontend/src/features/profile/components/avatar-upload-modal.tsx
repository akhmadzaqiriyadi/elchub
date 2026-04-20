/**
 * Avatar Upload Modal component
 * Allows user to upload and change their profile avatar
 */

'use client';

import { useState, useRef } from 'react';
import { BaseModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type AvatarUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  currentInitials: string;
};

export function AvatarUploadModal({
  isOpen,
  onClose,
  onUpload,
  currentInitials,
}: AvatarUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      await onUpload(selectedFile);
      resetModal();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      // Error toast is handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Profile Avatar"
      description="Upload a new profile picture"
    >
      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {/* Preview Section */}
      <div className="mb-6 flex flex-col items-center gap-4">
        {preview ? (
          <>
            {/* New Preview */}
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20 overflow-hidden">
              <img
                src={preview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              Preview looks good!
            </p>
          </>
        ) : (
          <>
            {/* Current Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2E417B] text-xl font-semibold text-white dark:bg-blue-600">
              {currentInitials}
            </div>
            <p className="text-sm text-primary/70 dark:text-slate-400">
              Current avatar
            </p>
          </>
        )}
      </div>

      {/* Upload Info */}
      <div className="mb-6 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          📎 Supported formats: JPG, PNG, GIF, WebP
          <br />
          📦 Max file size: 5MB
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Uploading...' : 'Choose Image'}
        </Button>
        {preview && (
          <Button
            onClick={handleUpload}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Uploading
              </span>
            ) : (
              'Upload'
            )}
          </Button>
        )}
      </div>
    </BaseModal>
  );
}
