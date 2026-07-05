import React, { useState } from 'react';

interface PlaceSearchProps {
  onNavigate: (coords: [number, number], zoom?: number) => void;
}

export default function PlaceSearch({ onNavigate }: PlaceSearchProps) {
  const [query, setQuery] = useState('');

  // Fixed structural navigation nodes
  const presets = [
    { name: 'Core Base Hub', coords: [-123.2078, 39.1502] as [number, number], zoom: 15 },
    { name: 'North Node Base', coords: [-123.2150, 39.1750] as [number, number], zoom: 16 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    // Support coordinate string inputs: "lon, lat"
    const parts = query.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      onNavigate([parts[0], parts[1]], 15);
    }
  };

  return (
    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '360px', zIndex: 5, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '6px' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Coordinates (e.g. -123.20, 39.15)..."
          style={{ flex: 1, backgroundColor: '#111114', color: '#ffffff', border: '1px solid #27272a', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
        <button type="submit" style={{ backgroundColor: '#e51a1a', color: '#ffffff', border: 'none', padding: '0 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>GO</button>
      </form>
      
      {/* Rapid Relocation Shortcut Markers */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {presets.map(p => (
          <button key={p.name} onClick={() => onNavigate(p.coords, p.zoom)} style={{ backgroundColor: 'rgba(17, 17, 20, 0.85)', border: '1px solid #3f3f46', color: '#d4d4d8', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            📍 {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
