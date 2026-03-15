import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useHistory } from '../hooks/useHistory';
import { Undo, Redo, RotateCcw, Settings, Check } from 'lucide-react';

export interface ProcessedImage {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
}

interface EditorState {
  crop: Crop;
  outputWidth: number;
  outputHeight: number;
  threshold: number;
}

interface Props {
  imageSrc: string;
  onGenerate: (data: ProcessedImage) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<Props> = ({ imageSrc, onGenerate, onCancel }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Natural dimensions of the source image
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  // Resolution percentage (applied to natural dims to get output)
  const [resPercent, setResPercent] = useState(25);

  const { state, set, undo, redo, revertAll, canUndo, canRedo } = useHistory<EditorState>({
    crop: { unit: '%', width: 100, height: 100, x: 0, y: 0 },
    outputWidth: 106,
    outputHeight: 17,
    threshold: 128
  });

  // Local state for UI inputs before committing to history
  const [localW, setLocalW] = useState(state.outputWidth.toString());
  const [localH, setLocalH] = useState(state.outputHeight.toString());
  const [localT, setLocalT] = useState(state.threshold.toString());

  // Update local values when history changes
  useEffect(() => {
    setLocalW(state.outputWidth.toString());
    setLocalH(state.outputHeight.toString());
    setLocalT(state.threshold.toString());
  }, [state]);

  // When image loads, detect natural dimensions and set defaults
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalW(nw);
    setNaturalH(nh);
    // Calculate default output dims at 25%
    const w = Math.max(1, Math.round(nw * 0.25));
    const h = Math.max(1, Math.round(nh * 0.25));
    setResPercent(25);
    set({ ...state, outputWidth: w, outputHeight: h });
  };

  // Apply resolution percentage to natural dims
  const handleResChange = (pct: number) => {
    setResPercent(pct);
    if (naturalW && naturalH) {
      const w = Math.max(1, Math.round(naturalW * (pct / 100)));
      const h = Math.max(1, Math.round(naturalH * (pct / 100)));
      set({ ...state, outputWidth: w, outputHeight: h });
    }
  };

  const handleApplyDimensions = () => {
    const w = parseInt(localW) || 106;
    const h = parseInt(localH) || 17;
    set({ ...state, outputWidth: w, outputHeight: h });
  };

  const drawPreview = (overrideW?: number, overrideH?: number, overrideThr?: number) => {
    if (!imgRef.current || !canvasRef.current || !state.crop.width || !state.crop.height) return null;
    
    const outW = overrideW ?? state.outputWidth;
    const outH = overrideH ?? state.outputHeight;
    const thr  = overrideThr ?? state.threshold;

    const cropX = (state.crop.x * imgRef.current.naturalWidth) / 100;
    const cropY = (state.crop.y * imgRef.current.naturalHeight) / 100;
    const cropW = (state.crop.width * imgRef.current.naturalWidth) / 100;
    const cropH = (state.crop.height * imgRef.current.naturalHeight) / 100;

    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    canvasRef.current.width = outW;
    canvasRef.current.height = outH;

    ctx.drawImage(
      imgRef.current,
      cropX, cropY, cropW, cropH,
      0, 0, outW, outH
    );

    const imageData = ctx.getImageData(0, 0, outW, outH);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      const color = luminance < thr ? 255 : 0;
      data[i] = data[i+1] = data[i+2] = color;
      data[i+3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return imageData;
  };

  // Re-draw when committed state OR crop changes
  useEffect(() => {
    drawPreview();
    // eslint-disable-next-line
  }, [state, imageSrc]);

  // Live preview: re-draw immediately whenever local slider values change
  useEffect(() => {
    const w = parseInt(localW) || state.outputWidth;
    const h = parseInt(localH) || state.outputHeight;
    const t = parseInt(localT) || state.threshold;
    drawPreview(w, h, t);
    // eslint-disable-next-line
  }, [localT, localW, localH]);

  return (
    <div className="image-editor-grid">
      {/* Left Card: Processing & Crop */}
      <div className="glass-panel editor-area">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Settings size={20} color="var(--accent-color)" />
            <h3>Image Processing</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-icon" onClick={undo} disabled={!canUndo} title="Undo">
              <Undo size={18} />
            </button>
            <button className="btn btn-icon" onClick={redo} disabled={!canRedo} title="Redo">
              <Redo size={18} />
            </button>
            <button className="btn btn-icon btn-danger" onClick={revertAll} disabled={!canUndo} title="Revert All">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* Settings Column */}
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Threshold */}
            <div className="input-group">
              <label>Threshold ({parseInt(localT) || state.threshold})</label>
              <input 
                type="range" 
                min="0" max="255" 
                value={localT} 
                onChange={e => setLocalT(e.target.value)}
                onMouseUp={() => set({ ...state, threshold: parseInt(localT) })}
                onTouchEnd={() => set({ ...state, threshold: parseInt(localT) })}
              />
            </div>

            {/* Resolution Percentage Slider */}
            <div className="input-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Resolution</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{resPercent}%</span>
              </label>
              <input 
                type="range" 
                min="1" max="100"
                value={resPercent}
                onChange={e => handleResChange(parseInt(e.target.value))}
              />
              {naturalW > 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  → {state.outputWidth} × {state.outputHeight} px
                </p>
              )}
            </div>

            {/* Width / Height manual inputs */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Width (W)</label>
                <input 
                  type="number" min="1" 
                  value={localW} 
                  onChange={e => setLocalW(e.target.value)} 
                  onBlur={handleApplyDimensions} 
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Height (H)</label>
                <input 
                  type="number" min="1" 
                  value={localH} 
                  onChange={e => setLocalH(e.target.value)} 
                  onBlur={handleApplyDimensions} 
                />
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                const idata = drawPreview();
                if (idata) {
                  onGenerate({ pixels: idata.data, width: state.outputWidth, height: state.outputHeight });
                }
              }}>
                <Check size={18} /> Generate Tupper
              </button>
              <button className="btn" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>

          {/* Crop Column */}
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ maxWidth: '100%', maxHeight: '400px', overflow: 'hidden', borderRadius: 'var(--radius)', border: '1px solid var(--panel-border)' }}>
               <ReactCrop 
                  crop={state.crop} 
                  onChange={(_, percentCrop) => set({ ...state, crop: percentCrop })} 
                >
                 <img 
                   ref={imgRef} 
                   src={imageSrc} 
                   alt="Upload" 
                   style={{ maxHeight: '400px', width: 'auto', display: 'block' }} 
                   crossOrigin="anonymous"
                   onLoad={handleImageLoad}
                 />
               </ReactCrop>
            </div>
            {naturalW > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Natural: {naturalW} × {naturalH} px
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Right Card: Monochrome Preview */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>
            Monochrome Preview
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>
            {state.outputWidth} × {state.outputHeight} px
          </span>
        </div>
        <div style={{ 
          background: '#000', 
          padding: '1rem', 
          borderRadius: 'var(--radius)', 
          border: '1px solid var(--panel-border)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          flex: 1,
          overflow: 'auto'
        }}>
          <canvas 
            ref={canvasRef} 
            style={{ 
              imageRendering: 'pixelated', 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid rgba(102, 252, 241, 0.3)',
              boxShadow: '0 0 10px rgba(102, 252, 241, 0.1)'
            }} 
          />
        </div>
      </div>
    </div>
  );
};
