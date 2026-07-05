import React from 'react';

interface FeatureTableProps {
  features: any[];
  onClose: () => void;
}

export default function FeatureTable({ features, onClose }: FeatureTableProps) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '240px', backgroundColor: '#111114', borderTop: '2px solid #27272a', display: 'flex', flexDirection: 'column', zIndex: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', backgroundColor: '#141417', borderBottom: '1px solid #27272a' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', uppercase: true, color: '#a1a1aa' }}>Property Inspector ({features.length} Assets Highlighted)</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px' }}>×</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {features.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontSize: '13px' }}>
            Select an interactive vector component on the workspace layer to unpack metadata.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#71717a', borderBottom: '1px solid #27272a' }}>
                <th style={{ padding: '8px' }}>Asset ID</th>
                <th style={{ padding: '8px' }}>Layer Schema</th>
                <th style={{ padding: '8px' }}>Properties / Dynamic Tags</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, idx) => (
                <tr key={f.id || idx} style={{ borderBottom: '1px solid #1c1c1f', backgroundColor: idx % 2 === 0 ? '#141417' : '#111114' }}>
                  <td style={{ padding: '8px', color: '#e51a1a', fontFamily: 'monospace' }}>{String(f.id).substring(0, 8)}</td>
                  <td style={{ padding: '8px', color: '#ffffff' }}>{f.layer}</td>
                  <td style={{ padding: '8px', color: '#d4d4d8' }}>
                    <pre style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{JSON.stringify(f.properties)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
