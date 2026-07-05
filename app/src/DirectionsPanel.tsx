import React, { useState } from 'react';

interface DirectionsPanelProps {
  onGenerateRoute: (start: [number, number], end: [number, number]) => void;
}

export default function DirectionsPanel({ onGenerateRoute }: DirectionsPanelProps) {
  const [startPoint, setStartPoint] = useState('-123.2078, 39.1502');
  const [endPoint, setEndPoint] = useState('-123.2150, 39.1750');

  const parseRoute = () => {
    const s = startPoint.split(',').map(p => parseFloat(p.trim()));
    const e = endPoint.split(',').map(p => parseFloat(p.trim()));
    if (s.length === 2 && e.length === 2 && !s.some(isNaN) && !e.some(isNaN)) {
      onGenerateRoute([s[0], s[1]], [e[0], e[1]]);
    }
  };

  return (
    <div style={{ position: 'absolute', top: '20px', left: '20px', width: '320px', backgroundColor: 'rgba(17, 17, 20, 0.95)', borderLeft: '3px solid #e51a1a', padding: '20px', borderRadius: '0 4px 4px 0', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 5 }}>
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#ffffff', margin: '0 0 16px 0', letterSpacing: '0.05em' }}>Network Topology Routing</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px', textTransform: 'uppercase' }}>Origin Node</label>
          <input type="text" value={startPoint} onChange={e => setStartPoint(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#18181b', color: '#ffffff', border: '1px solid #27272a', padding: '8px', borderRadius: '4px', fontSize: '13px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px', textTransform: 'uppercase' }}>Target Node</label>
          <input type="text" value={endPoint} onChange={e => setEndPoint(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#18181b', color: '#ffffff', border: '1px solid #27272a', padding: '8px', borderRadius: '4px', fontSize: '13px' }} />
        </div>
        <button onClick={parseRoute} style={{ backgroundColor: '#e51a1a', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}>
          Map Link Vector
        </button>
      </div>
    </div>
  );
}
