import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageMap() {
  const navigate = useNavigate();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [activePipeline, setActivePipeline] = useState<'layers' | 'telemetry'>('layers');
  
  // High-frequency telemetry states
  const [isTracking, setIsTracking] = useState(true);
  const [currentCoords, setCurrentCoords] = useState({ lat: 39.1502, lon: -123.2078 });
  const [tickCount, setTickCount] = useState(0);

  // High-fidelity map layers state
  const [layers, setLayers] = useState([
    { id: 'buildings', name: 'Overture 3D Building Meshes', active: true, count: '14,205 nodes' },
    { id: 'osm-roads', name: 'OSM Road Network Geometry', active: true, count: '3,841 vectors' },
    { id: 'intercell-nodes', name: 'Intercell Solar Hardware Nodes', active: true, count: '12 assets' },
  ]);

  // 50ms High-Frequency Tracking Loop
  useEffect(() => {
    let trackingInterval: NodeJS.Timeout;

    if (isTracking) {
      trackingInterval = setInterval(() => {
        // High-precision delta updates simulating high-speed path traversal
        setCurrentCoords(prev => {
          const microDeltaLat = (Math.random() - 0.45) * 0.00008; 
          const microDeltaLon = (Math.random() - 0.52) * 0.00012;
          return {
            lat: parseFloat((prev.lat + microDeltaLat).toFixed(6)),
            lon: parseFloat((prev.lon + microDeltaLon).toFixed(6))
          };
        });
        setTickCount(t => t + 1);
      }, 50); // Exact 50 millisecond clock cycle
    }

    return () => clearInterval(trackingInterval);
  }, [isTracking]);

  const toggleLayer = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  return (
    <div className="h-screen w-screen bg-[#0A0A0A] text-neutral-200 font-mono text-xs overflow-hidden flex flex-col pt-14 selection:bg-red-600 selection:text-white">
      
      {/* Engine Interface Action Row */}
      <div className="h-12 bg-[#111111] border-b border-[#222222] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-widest text-[10px] font-bold"
          >
            &lt; Return to Hub
          </button>
          <div className="h-4 w-px bg-[#222222] hidden md:block"></div>
          <span className="font-bold text-white tracking-wider uppercase hidden md:inline">
            GeoPro Spatial Map <span className="text-red-600">Engine Instance</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`px-3 py-1 border rounded font-bold uppercase text-[10px] transition-all ${
              isTracking 
                ? 'bg-red-950/30 border-red-600 text-red-400' 
                : 'bg-[#1A1A1A] border-[#2A2A2A] text-neutral-400'
            }`}
          >
            {isTracking ? '● STREAMING (50ms)' : '|| PAUSED'}
          </button>
          <button 
            onClick={() => setControlsVisible(!controlsVisible)}
            className="px-3 py-1 bg-[#1A1A1A] hover:bg-red-950/40 border border-[#2A2A2A] hover:border-red-900 rounded font-bold uppercase text-[10px] transition-all"
          >
            {controlsVisible ? 'Collapse Sidebar' : 'Expand Sidebar'}
          </button>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex flex-1 relative overflow-hidden flex-col md:flex-row">
        
        {/* Left Side Advanced Control Console */}
        <aside className={`bg-[#0F0F0F] border-b md:border-b-0 md:border-r border-[#222222] flex flex-col shrink-0 transition-all duration-200 z-20 ${
          controlsVisible ? 'w-full md:w-80 h-1/2 md:h-full opacity-100' : 'w-0 h-0 opacity-0 pointer-events-none overflow-hidden'
        }`}>
          {/* Sub-panel Toggles */}
          <div className="flex bg-[#141414] border-b border-[#222222] text-[10px] font-bold uppercase tracking-wider">
            <button 
              onClick={() => setActivePipeline('layers')}
              className={`flex-1 py-3 text-center transition-all ${activePipeline === 'layers' ? 'text-red-500 bg-[#0F0F0F] border-b border-red-600' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Data Pipelines
            </button>
            <button 
              onClick={() => setActivePipeline('telemetry')}
              className={`flex-1 py-3 text-center transition-all ${activePipeline === 'telemetry' ? 'text-red-500 bg-[#0F0F0F] border-b border-red-600' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Live Diagnostics
            </button>
          </div>

          {/* Context Switching Panel Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activePipeline === 'layers' ? (
              <div className="space-y-3">
                <div className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase">Ingested Map Data Vectors</div>
                <div className="space-y-2">
                  {layers.map(layer => (
                    <div key={layer.id} className="p-3 bg-[#141414] border border-[#222222] rounded flex items-start justify-between space-x-3 hover:border-[#333333] transition-colors">
                      <div className="space-y-1">
                        <div className="font-sans font-bold text-white leading-tight">{layer.name}</div>
                        <div className="text-[10px] text-neutral-500">Cached: {layer.count}</div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={layer.active}
                        onChange={() => toggleLayer(layer.id)}
                        className="accent-red-600 h-4 w-4 bg-black border-[#333] rounded cursor-pointer shrink-0 mt-0.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-[11px]">
                <div className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase">Engine Diagnostic Stream</div>
                <div className="bg-[#141414] p-3 border border-[#222222] rounded space-y-1.5 font-mono text-neutral-400">
                  <div>LAT_REF: <span className="text-white text-xs font-bold">{currentCoords.lat}° N</span></div>
                  <div>LON_REF: <span className="text-white text-xs font-bold">{currentCoords.lon}° W</span></div>
                  <div>POLLING_CLOCK: <span className="text-red-500">50ms (20 Hz)</span></div>
                  <div>TOTAL_TICKS: <span className="text-neutral-300">{tickCount}</span></div>
                  <div className="pt-2 border-t border-[#222222] mt-2 flex items-center justify-between text-[10px]">
                    <span>STREAM MATRIX:</span>
                    <span className="text-green-400 font-bold">SYNCHRONIZED</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Console Activity Log */}
          <div className="p-3 bg-[#131313] border-t border-[#222222] text-[10px] text-neutral-500 font-mono hidden md:block">
            <div className="text-red-600 font-bold mb-0.5">SYSTEM_STREAM_LOG</div>
            <div className="truncate text-neutral-400">&gt; Refresh interval set to strict 50ms pipeline.</div>
            <div className="truncate text-neutral-300">&gt; Frame update executed at tick: {tickCount}</div>
          </div>
        </aside>

        {/* Primary Map Viewport Target Container */}
        <main className="flex-1 relative bg-[#090909]">
          
          {/* Simulated Spatial Field Layout */}
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:24px_24px] opacity-40 flex items-center justify-center">
            <div className="text-center space-y-2 pointer-events-none px-4">
              <div className="text-[11px] tracking-widest uppercase text-neutral-600 font-bold">Spatial Vector Engine Viewport</div>
              <div className="text-[10px] text-neutral-700 font-mono">Position matrix updating at 20 cycles per second</div>
            </div>
          </div>

          {/* Floating Heads-Up Display Telemetry Windows */}
          <div className="absolute top-4 right-4 bg-[#111111]/90 backdrop-blur-md border border-[#222222] p-3 rounded shadow-2xl space-y-1.5 z-10 text-[10px] font-mono text-neutral-400 min-w-[180px]">
            <div className="font-bold text-red-500 uppercase tracking-widest border-b border-[#222222] pb-1 mb-1 text-[9px] flex justify-between">
              <span>ENGINE HUD</span>
              <span className="animate-ping text-red-600">●</span>
            </div>
            <div>LAT: <span className="text-white font-sans font-bold">{currentCoords.lat}</span></div>
            <div>LON: <span className="text-white font-sans font-bold">{currentCoords.lon}</span></div>
            <div className="border-t border-[#222222] pt-1 mt-1 text-[9px] text-neutral-500">CYCLE: <span className="text-neutral-300">50ms interval</span></div>
          </div>

          {/* Bottom Attribute Features Data Terminal Table */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#111111] border-t border-[#222222] z-10 flex flex-col">
            <div className="px-4 py-2 bg-[#141414] border-b border-[#222222] text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex justify-between items-center">
              <span>Geospatial Feature Attributes Terminal</span>
              <span className="text-[9px] font-mono text-red-500">Live delta sync active</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full text-left font-mono text-[11px] text-neutral-400">
                <thead>
                  <tr className="text-neutral-500 border-b border-[#222222]">
                    <th className="pb-1 font-bold uppercase">Target Entity</th>
                    <th className="pb-1 font-bold uppercase">Live Coordinate Context</th>
                    <th className="pb-1 font-bold uppercase">Polling Threshold</th>
                    <th className="pb-1 font-bold uppercase">Engine Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1c]">
                  <tr>
                    <td className="py-1 text-white">Active Grid Matrix Center</td>
                    <td className="text-neutral-300">{currentCoords.lat}° N, {currentCoords.lon}° W</td>
                    <td className="text-red-500">50ms delta loop</td>
                    <td className="text-green-400 font-bold">STREAMING</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-neutral-500">Infrastructure Relay Asset</td>
                    <td className="text-neutral-600">Static Base Bind</td>
                    <td className="text-neutral-600">Locked</td>
                    <td className="text-neutral-600">STANDBY</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
