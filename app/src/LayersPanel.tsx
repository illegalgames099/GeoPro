import React from 'react';

interface LayersPanelProps {
  visibleLayers: { buildings: boolean; roads: boolean; infrastructure: boolean; terrain: boolean };
  setVisibleLayers: React.Dispatch<React.SetStateAction<{ buildings: boolean; roads: boolean; infrastructure: boolean; terrain: boolean }>>;
}

export default function LayersPanel({ visibleLayers, setVisibleLayers }: LayersPanelProps) {
  const toggleLayer = (key: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const layersConfig = [
    { label: 'Structural Shells (3D Extrusions)', key: 'buildings' as const },
    { label: 'Transportation Network Grid', key: 'roads' as const },
    { label: 'Cellular Distribution Array', key: 'infrastructure' as const },
    { label: 'High-Fidelity Elevation Contours', key: 'terrain' as const },
  ];

  return (
    <div style={{ position: 'absolute', top: '20px', left: '20px', width: '320px', backgroundColor: 'rgba(17, 17, 20, 0.95)', borderLeft: '3px solid #e51a1a', padding: '20px', borderRadius: '0 4px 4px 0', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 5 }}>
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#ffffff', margin: '0 0 16px 0', letterSpacing: '0.05em' }}>Geospatial Overlays</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {layersConfig.map(layer => (
          <label key={layer.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px', borderRadius: '4px', backgroundColor: '#18181b', transition: 'background 0.2s' }}>
            <span style={{ fontSize: '13px', color: visibleLayers[layer.key] ? '#ffffff' : '#71717a' }}>{layer.label}</span>
            <input 
              type="checkbox" 
              checked={visibleLayers[layer.key]} 
              onChange={() => toggleLayer(layer.key)}
              style={{ accentColor: '#e51a1a', width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
