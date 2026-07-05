import React, { useState } from 'react';

export default function PageTile() {
  const [coords, setCoords] = useState({ z: 14, x: 2620, y: 6331 });

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0a0a0c', color: '#ffffff', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ borderBottom: '2px solid #851414', paddingBottom: '20px', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', tracking: '0.05em', margin: 0 }}>PMTILES BOUNDING FIELD ANALYZER</h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '6px' }}>Inspect and verify coordinate boundaries inside raw matrix indices.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div style={{ backgroundColor: '#111114', padding: '24px', borderRadius: '4px', border: '1px solid #27272a', height: 'fit-content' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', uppercase: true, margin: '0 0 16px 0', color: '#ffffff' }}>Matrix Target</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['z', 'x', 'y'].map((axis) => (
                <div key={axis}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>{axis.toUpperCase()} Coordinate</label>
                  <input 
                    type="number" 
                    value={coords[axis as keyof typeof coords]} 
                    onChange={(e) => setCoords({ ...coords, [axis]: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#18181b', color: '#ffffff', border: '1px solid #27272a', padding: '8px', borderRadius: '4px', fontSize: '14px', fontFamily: 'monospace' }} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#111114', padding: '32px', borderRadius: '4px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#e51a1a', fontWeight: 'bold', uppercase: true }}>Target Vector Uniform Resource Locator</span>
              <div style={{ backgroundColor: '#18181b', padding: '14px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', color: '#d4d4d8', marginTop: '8px', wordBreak: 'break-all', border: '1px solid #27272a' }}>
                https://api.geopro.local/vectors/v3/{coords.z}/{coords.x}/{coords.y}.mvt
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #27272a', paddingTop: '20px', marginTop: '20px' }}>
              <h4 style={{ fontSize: '12px', uppercase: true, color: '#a1a1aa', margin: '0 0 12px 0' }}>BBOX Matrix Calculation</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', fontFamily: 'monospace' }}>
                <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '4px' }}><span style={{ color: '#71717a' }}>NW Lon:</span> -123.2226</div>
                <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '4px' }}><span style={{ color: '#71717a' }}>NW Lat:</span> 39.1667</div>
                <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '4px' }}><span style={{ color: '#71717a' }}>SE Lon:</span> -123.1787</div>
                <div style={{ backgroundColor: '#18181b', padding: '10px', borderRadius: '4px' }}><span style={{ color: '#71717a' }}>SE Lat:</span> 39.1301</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
