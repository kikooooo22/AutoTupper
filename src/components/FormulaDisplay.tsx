import React from 'react';

interface Props {
  height: number;
}

export const FormulaDisplay: React.FC<Props> = ({ height }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.8rem', whiteSpace: 'nowrap' }}>
        Tupper's Self-Referential Formula
      </h3>
      
      <div style={{ 
        fontFamily: "'Cambria Math', 'Times New Roman', serif", 
        fontSize: '1rem', 
        color: '#fff',
        background: 'rgba(0,0,0,0.3)',
        padding: '0.6rem 1rem',
        borderRadius: 'var(--radius)',
        border: '1px solid rgba(102, 252, 241, 0.2)',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
        textAlign: 'center',
        overflowX: 'auto',
        maxWidth: '100%',
        whiteSpace: 'nowrap'
      }}>
        <span><sup style={{fontSize: '0.7rem'}}>1</sup>&frasl;<sub style={{fontSize: '0.7rem'}}>2</sub></span>
        <span style={{ margin: '0 0.4rem', color: 'var(--accent-color)' }}>&lt;</span>
        <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>&lfloor;</span>
        <span style={{ margin: '0 0.15rem' }}>mod</span>
        <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>(</span>
        <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>&lfloor;</span>
        <span style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center', margin: '0 0.15rem' }}>
          <div style={{ borderBottom: '1px solid #fff', padding: '0 0.2rem', lineHeight: '1.1' }}>y</div>
          <div style={{ padding: '0 0.2rem', lineHeight: '1.1', color: 'var(--accent-color)', fontWeight: 'bold' }}>{height}</div>
        </span>
        <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>&rfloor;</span>
        <span style={{ margin: '0 0.15rem' }}>2</span>
        <sup style={{ fontSize: '0.75rem' }}>
          &minus;<span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{height}</span>
          <span style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '2px' }}>&lfloor;</span>x<span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>&rfloor;</span>
          &minus; mod(<span style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '2px' }}>&lfloor;</span>y<span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>&rfloor;</span>, <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{height}</span>)
        </sup>
        <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>, 2)</span>
        <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', fontWeight: 300 }}>&rfloor;</span>
      </div>
    </div>
  );
};

