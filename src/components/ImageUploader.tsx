import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface Props {
  onImageLoaded: (url: string) => void;
}

export const ImageUploader: React.FC<Props> = ({ onImageLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onImageLoaded(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  return (
    <div
      className="glass-panel"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      style={{
        borderStyle: 'dashed',
        borderWidth: '2px',
        borderColor: isDragging ? 'var(--accent-color)' : 'var(--panel-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        background: isDragging ? 'rgba(102, 252, 241, 0.05)' : 'var(--panel-bg)'
      }}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <Upload size={48} color={isDragging ? 'var(--accent-color)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
      <h3>Upload an Image</h3>
      <p style={{ marginTop: '0.5rem' }}>Drag and drop or click to select a file</p>
      <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>(JPG, PNG, WebP)</p>
      <input
        type="file"
        id="file-upload"
        accept="image/jpeg, image/png, image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};
