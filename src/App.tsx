import React, { useState, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageEditor, type ProcessedImage } from './components/ImageEditor';
import { TupperRenderer } from './components/TupperRenderer';
import { FormulaDisplay } from './components/FormulaDisplay';
import { HistoryList, type TupperItem } from './components/HistoryList';
import { encodeToTupper, decodeFromTupper } from './utils/tupper';
import { Clock, Info, X } from 'lucide-react';
import './App.css';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  const [tupperK, setTupperK] = useState<string>("0");
  const [tupperW, setTupperW] = useState<number>(106);
  const [tupperH, setTupperH] = useState<number>(17);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = (data: ProcessedImage) => {
    // 1. Calculate K
    const k = encodeToTupper(data.pixels, data.width, data.height, 128);
    
    // 2. Update state
    setTupperK(k);
    setTupperW(data.width);
    setTupperH(data.height);

    // 3. Generate thumbnail (approximate or just the grid)
    generateThumbnailAndSave(k, data.width, data.height);
  };

  const generateThumbnailAndSave = (kStr: string, w: number, h: number) => {
    const canvas = document.createElement('canvas');
    const pixelSize = Math.max(1, Math.floor(200 / Math.max(w, h)));
    canvas.width = w * pixelSize;
    canvas.height = h * pixelSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const grid = decodeFromTupper(kStr, w, h);
    ctx.fillStyle = '#66fcf1';
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        if (grid[x] && grid[x][y]) {
          ctx.fillRect(x * pixelSize, (h - 1 - y) * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    const thumbnail = canvas.toDataURL('image/png', 0.5);
    
    const item: TupperItem = {
      id: Date.now().toString(),
      k: kStr,
      width: w,
      height: h,
      timestamp: Date.now(),
      thumbnail
    };

    try {
      const stored = localStorage.getItem('tupper_history');
      let items: TupperItem[] = stored ? JSON.parse(stored) : [];
      items = [item, ...items].slice(0, 20); // Keep last 20
      localStorage.setItem('tupper_history', JSON.stringify(items));
      window.dispatchEvent(new Event('history_updated'));
    } catch(e) {}
  };

  const handleLoadItem = (item: TupperItem) => {
    setTupperK(item.k);
    setTupperW(item.width);
    setTupperH(item.height);
    setImageSrc(null); // Close editor if open
  };

  const handleDecodeRequest = (k: string, w: number, h: number) => {
    setTupperK(k);
    setTupperW(w);
    setTupperH(h);
    // Optionally create a new history item when manual decoding?
    generateThumbnailAndSave(k, w, h);
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target?.result as string);
          if (json.k && json.width && json.height) {
            handleDecodeRequest(json.k, json.width, json.height);
          } else {
             alert('Invalid .tupper file format');
          }
        } catch (err) {
          alert('Failed to parse file');
        }
      };
      reader.readAsText(file);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div className="app-container" style={{ flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Info Modal */}
      {isInfoOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setIsInfoOpen(false)}
        >
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button className="btn btn-icon" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={() => setIsInfoOpen(false)}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1rem', color: 'var(--accent-color)', paddingRight: '2rem' }}>How AutoTupper Works</h2>
            <p style={{ marginBottom: '1rem' }}>
              Tupper's Self-Referential Formula is a mathematical equation that visually represents itself when graphed. By changing the enormous constant <b>k</b>, the formula can draw <i>any</i> possible monochrome image within its bounds.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              This engine processes your uploaded images, applies a monochrome threshold, converts the pixel matrix to binary, and calculates the exact <b>k</b> value required for the Tupper Formula to draw your image.
            </p>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius)', border: '1px dashed var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>The Original Formula</span>
              <div style={{ width: '100%', overflowX: 'auto', fontSize: 'clamp(0.65rem, 2vw, 1rem)' }}>
                <FormulaDisplay height={17} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        accept=".tupper,application/json" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleJsonImport} 
      />

      {/* Top Header Row */}
      <div style={{ padding: '0.7rem 1rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(11, 12, 16, 0.9)', zIndex: 100, flexShrink: 0, gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="btn" style={{ border: 'none', gap: '0.5rem' }} onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Toggle History">
             <Clock size={20} color={isSidebarOpen ? 'var(--accent-color)' : 'var(--text-muted)'} />
             <span className="nav-btn-text" style={{ color: isSidebarOpen ? 'var(--accent-color)' : 'var(--text-muted)' }}>History</span>
          </button>
        </div>
        
        <div className="header-title-container" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', margin: 0, background: 'linear-gradient(135deg, var(--accent-color) 0%, #2196f3 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AutoTupper</h1>
        </div>

        <div>
          <button className="btn" onClick={() => setIsInfoOpen(true)} title="Information">
            <Info size={18} /><span className="nav-btn-text"> Info</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Sidebar backdrop (mobile) - click to close */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 89, background: 'rgba(0,0,0,0.5)' }}
          />
        )}

        {/* Collapsible Sidebar with swipe-to-close */}
        <div 
          className="sidebar" 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, bottom: 0, 
            height: '100%',
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            zIndex: 90,
            boxShadow: isSidebarOpen ? '5px 0 15px rgba(0,0,0,0.5)' : 'none',
            touchAction: 'pan-y'
          }}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            (e.currentTarget as HTMLElement).dataset.touchStartX = touch.clientX.toString();
          }}
          onTouchEnd={(e) => {
            const startX = parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || '0');
            const endX = e.changedTouches[0].clientX;
            if (startX - endX > 60) setIsSidebarOpen(false); // swipe left
          }}
        >
          <HistoryList onLoadItem={handleLoadItem} />
        </div>

        {/* Main Content Layout Wrapper */}
        <div style={{ 
            flex: 1, 
            padding: 'clamp(0.75rem, 2vw, 2rem)', 
            display: 'flex',
            justifyContent: 'center',
            overflowY: 'auto'
        }}>
          <div className="main-grid-layout" style={{ width: '100%', maxWidth: '1800px' }}>
            <div className="editor-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Image Input Source</h2>
                {imageSrc && (
                  <button className="btn btn-danger" onClick={() => setImageSrc(null)}>
                    Clear Image
                  </button>
                )}
              </div>
              {imageSrc ? (
                <ImageEditor 
                  imageSrc={imageSrc} 
                  onGenerate={handleGenerate} 
                  onCancel={() => setImageSrc(null)} 
                />
              ) : (
                <ImageUploader onImageLoaded={(url) => setImageSrc(url)} />
              )}
            </div>

            {/* Renderer Section */}
            <div className="renderer-section">
              <TupperRenderer 
                k={tupperK} 
                width={tupperW} 
                height={tupperH} 
                onDecodeRequest={handleDecodeRequest}
                onImportPress={() => fileInputRef.current?.click()}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
