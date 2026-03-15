import React, { useEffect, useState } from 'react';
import { Clock, Trash2, Import } from 'lucide-react';

export interface TupperItem {
  id: string;
  k: string;
  width: number;
  height: number;
  timestamp: number;
  thumbnail: string;
}

interface Props {
  onLoadItem: (item: TupperItem) => void;
}

export const HistoryList: React.FC<Props> = ({ onLoadItem }) => {
  const [items, setItems] = useState<TupperItem[]>([]);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('tupper_history');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch(e) { console.error('Error loading history', e); }
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener('history_updated', loadHistory);
    return () => window.removeEventListener('history_updated', loadHistory);
  }, []);

  const deleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    localStorage.setItem('tupper_history', JSON.stringify(updated));
    setItems(items.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    localStorage.removeItem('tupper_history');
    setItems([]);
  };

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <Clock size={20} color="var(--accent-color)" />
        <h2>Session History</h2>
      </div>
      
      {items.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>No generated items yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '0 0 1.5rem 0', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>History</h3>
            <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.8rem' }} onClick={clearHistory}>Clear</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.5rem', paddingRight: '0.8rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: 'var(--radius)', 
                border: '1px solid var(--panel-border)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                transition: 'border-color 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}
              >
                <img src={item.thumbnail} alt="Thumbnail" style={{ width: '100%', height: '80px', objectFit: 'contain', background: '#0b0c10', borderRadius: '4px' }} />
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '0.3rem' }}><strong>W:</strong> {item.width} | <strong>H:</strong> {item.height}</div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: 'rgba(0,0,0,0.5)', padding: '0.3rem', borderRadius: '4px' }}>
                    {item.k}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => onLoadItem(item)}>
                    <Import size={14} /> Load
                  </button>
                  <button className="btn btn-danger btn-icon" style={{ padding: '0.4rem' }} onClick={() => deleteItem(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
