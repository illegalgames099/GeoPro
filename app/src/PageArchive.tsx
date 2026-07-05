import React from 'react';

export default function PageArchive() {
  const archives = [
    { title: 'Overture Building Dataset', date: '2026-06-15', scale: 'Regional Extents', size: '142.4 MB' },
    { title: 'Infrastructure Routing Presets', date: '2026-06-01', scale: 'Local Utility Array', size: '18.9 MB' },
    { title: 'Topographical Dem Vector Set', date: '2026-05-20', scale: 'Sub-divisional Grids', size: '284.1 MB' },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0a0a0c', color: '#ffffff', padding: '40px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ borderBottom: '2px solid #851414', paddingBottom: '20px', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', tracking: '0.05em', margin: 0 }}>METADATA ARCHIVE CATALOG</h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '6px' }}>Stored structural definitions and compilation layer caches.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {archives.map((item, index) => (
            <div key={index} style={{ backgroundColor: '#111114', border: '1px solid #27272a', padding: '24px', borderRadius: '4px', position: 'relative', transition: 'all 0.2s', cursor: 'pointer' }}
                 onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e51a1a'}
                 onMouseLeave={(e) => e.currentTarget.style.borderColor = '#27272a'}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#e51a1a', textTransform: 'uppercase', tracking: '0.1em' }}>Dataset Bundle</span>
              <h3 style={{ fontSize: '18px', margin: '8px 0 16px 0', color: '#ffffff' }}>{item.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#a1a1aa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Compiled:</span><span style={{ color: '#d4d4d8' }}>{item.date}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Spatial Footprint:</span><span style={{ color: '#d4d4d8' }}>{item.scale}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Disk Footprint:</span><span style={{ color: '#d4d4d8', fontFamily: 'monospace' }}>{item.size}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
