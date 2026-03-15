import React, { useRef, useState, useEffect } from 'react';
import { decodeFromTupper } from '../utils/tupper';
import { Download, LayoutGrid, Image as ImageIcon, Copy, FileUp } from 'lucide-react';

interface Props {
  k: string;
  width: number;
  height: number;
  onDecodeRequest: (k: string, w: number, h: number) => void;
  onImportPress: () => void;
}

export const TupperRenderer: React.FC<Props> = ({ k, width, height, onDecodeRequest, onImportPress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [inputK, setInputK] = useState(k);
  const [inputW, setInputW] = useState(width.toString());
  const [inputH, setInputH] = useState(height.toString());

  useEffect(() => {
    setInputK(k);
    setInputW(width.toString());
    setInputH(height.toString());
    drawGrid(k, width, height);
  }, [k, width, height]);

  const drawGrid = (kVal: string, w: number, h: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // We will render it larger so it's not super tiny. Pixel size = 4 for display.
    const pixelSize = Math.max(2, Math.min(10, Math.floor(800 / Math.max(w, h))));
    
    canvasRef.current.width = w * pixelSize;
    canvasRef.current.height = h * pixelSize;

    ctx.fillStyle = '#0b0c10'; // Background
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const grid = decodeFromTupper(kVal, w, h);

    ctx.fillStyle = '#66fcf1'; // Foreground color for the text/shapes
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        if (grid[x] && grid[x][y]) {
          // Tupper reads left-to-right from bottom-to-top.
          // In Canvas, (0,0) is top-left. So X is directly X, Y is inverted.
          // Fixing the mirror effect by not inverting X.
          const drawY = h - 1 - y;
          ctx.fillRect(x * pixelSize, drawY * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  };

  const handleDecodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDecodeRequest(inputK, parseInt(inputW) || 106, parseInt(inputH) || 17);
  };

  const exportImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `tupper_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const exportTupperData = () => {
    const data = {
      k: k,
      width: width,
      height: height,
      formula: `1/2 < floor(mod(floor(y / ${height}) * 2^(-${height}*floor(x) - mod(floor(y), ${height})), 2))`
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `tupper_${Date.now()}.tupper`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel renderer-area">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <LayoutGrid size={20} color="var(--accent-color)" />
          <h3>Tupper Output</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-icon" style={{ borderColor: 'var(--accent-color)', borderRadius: '8px' }} onClick={onImportPress} title="Import Data (.tupper)">
            <FileUp size={18} /> Import
          </button>
          <button className="btn btn-icon" style={{ borderRadius: '8px' }} onClick={exportImage} title="Export Image (PNG)">
            <ImageIcon size={18} />
          </button>
          <button className="btn btn-icon" style={{ borderRadius: '8px' }} onClick={exportTupperData} title="Export Data (.tupper)">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius)', border: '1px solid var(--panel-border)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'none' }}>
        {/* We will move the formula to the bottom, this chunk is deleted */}
      </div>

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'rgba(0,0,0,0.5)',
        padding: '1rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--panel-border)',
        overflow: 'auto',
        minHeight: '200px'
      }}>
        {(!k || k === "0") ? (
          <p style={{ color: 'var(--text-muted)' }}>Generate or paste a Tupper constant to see it here.</p>
        ) : (
          <canvas ref={canvasRef} style={{ maxWidth: '100%', boxShadow: '0 0 10px rgba(102, 252, 241, 0.2)' }} />
        )}
      </div>

      <form onSubmit={handleDecodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        
        {/* Full-width Decode button as separator */}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.7rem', fontSize: '1rem', letterSpacing: '0.5px' }}>
          Decode And Render
        </button>

        {/* Styled Modified Formula Above K Input */}
        <div style={{ 
          fontFamily: "'Cambria Math', 'Times New Roman', serif", 
          fontSize: '1rem', 
          color: '#fff',
          background: 'rgba(0,0,0,0.3)',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          border: '1px dashed var(--panel-border)',
          textAlign: 'center',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          marginTop: '0.5rem',
          marginBottom: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Modified Equation (H = {height})</span>
          <div>
            <span><sup style={{fontSize: '0.7rem'}}>1</sup>&frasl;<sub style={{fontSize: '0.7rem'}}>2</sub></span>
            <span style={{ margin: '0 0.5rem', color: 'var(--accent-color)' }}>&lt;</span>
            <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>&lfloor;</span>
            <span style={{ margin: '0 0.2rem' }}>mod</span>
            <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>(</span>
            <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>&lfloor;</span>
            <span style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center', margin: '0 0.2rem' }}>
              <div style={{ borderBottom: '1px solid #fff', padding: '0 0.2rem', lineHeight: '1.1' }}>y</div>
              <div style={{ padding: '0 0.2rem', lineHeight: '1.1', color: 'var(--accent-color)', fontWeight: 'bold' }}>{height}</div>
            </span>
            <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>&rfloor;</span>
            <span style={{ margin: '0 0.2rem' }}>2</span>
            <sup style={{ fontSize: '0.8rem' }}>
              &minus;{height === 17 ? <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>17</span> : <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{height}</span>} 
              <span style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '2px' }}>&lfloor;</span>x<span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>&rfloor;</span>
              &minus; mod(<span style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '2px' }}>&lfloor;</span>y<span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>&rfloor;</span>, <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{height}</span>)
            </sup>
            <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>, 2)</span>
            <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>&rfloor;</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ width: '80px', marginBottom: 0 }}>
             <label>Width</label>
             <input type="number" placeholder="W" value={inputW} onChange={e => setInputW(e.target.value)} />
          </div>
          <div className="input-group" style={{ width: '80px', marginBottom: 0 }}>
             <label>Height</label>
             <input type="number" placeholder="H" value={inputH} onChange={e => setInputH(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Custom Constant <b>k</b></p>
          <button type="button" className="btn btn-icon" style={{ padding: '0.3rem', borderRadius: '8px' }} onClick={() => navigator.clipboard.writeText(inputK)} title="Copy k value">
             <Copy size={14} /> Copy K
          </button>
        </div>
        
        <div className="input-group" style={{ marginBottom: 0 }}>
           <textarea 
             placeholder="Enter huge k value..." 
             value={inputK} 
             onChange={e => {
               setInputK(e.target.value);
               e.target.style.height = 'auto'; // Auto resize trick
               e.target.style.height = e.target.scrollHeight + 'px';
             }} 
             style={{ 
               width: '100%', 
               minHeight: '200px', 
               background: 'rgba(0,0,0,0.4)', 
               border: '1px solid var(--panel-border)', 
               color: '#fff', 
               padding: '0.8rem', 
               borderRadius: '6px', 
               fontFamily: 'monospace',
               fontSize: '0.85rem',
               resize: 'none',
               wordBreak: 'break-all',
               overflow: 'hidden'
             }} 
             ref={(el) => {
               if (el) {
                 el.style.height = 'auto';
                 el.style.height = el.scrollHeight + 'px';
               }
             }}
           />
        </div>
      </form>

        {/* Formula moved up */}

    </div>
  );
};
