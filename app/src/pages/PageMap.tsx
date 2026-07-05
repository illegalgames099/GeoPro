import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Authenticated Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiamFja2Fsb3BlcGxheXMiLCJhIjoiY21ubmppMnQ0MXV5cTJycHB6NzI2Z3ozaSJ9.rC3Z3wHDO5qKVLdiA9XlLg';

export default function PageMap() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  
  const [controlsVisible, setControlsVisible] = useState(true);
  const [activePipeline, setActivePipeline] = useState<'layers' | 'telemetry'>('layers');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // High-frequency telemetry states (20 Hz loop)
  const [isTracking, setIsTracking] = useState(true);
  const [currentCoords, setCurrentCoords] = useState({ lat: 39.1502, lon: -123.2078 }); // Center coordinates for Ukiah, CA
  const [tickCount, setTickCount] = useState(0);

  const [layers, setLayers] = useState([
    { id: 'mapbox-3d-buildings', name: 'Mapbox 3D Extrusion Mesh', active: true, count: 'Engine Native' },
    { id: 'osm-roads', name: 'OSM Road Network Geometry', active: true, count: '3,841 vectors' },
    { id: 'intercell-nodes', name: 'Intercell Solar Hardware Nodes', active: true, count: '12 assets' },
  ]);

  // 1. Initialize Mapbox Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // High-contrast premium dark theme
      center: [-123.2078, 39.1502], // [longitude, latitude]
      zoom: 14.5,
      pitch: 45, // Angled projection to clearly emphasize 3D dimensions
      bearing: -15,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // Create a dedicated red custom HTML element for the telemetry marker
      const el = document.createElement('div');
      el.className = 'telemetry-ping';
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.backgroundColor = '#dc2626'; // Brand-specific high-vis pure red
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #ffffff';
      el.style.boxShadow = '0 0 12px #dc2626, 0 0 4px #000000';
      el.style.transition = 'transform 0.03s linear'; // Ultra-smooth low-latency transitions

      // Add high-frequency tracker marker to the map layer instance
      const marker = new mapboxgl.Marker(el)
        .setLngLat([-123.2078, 39.1502])
        .addTo(map);

      markerRef.current = marker;

      // Add Mapbox 3D Building Layer directly on engine loading
      const currentLayers = map.getStyle().layers;
      const labelLayerId = currentLayers?.find(layer => layer.type === 'symbol' && layer.layout?.['text-field'])?.id;

      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 12,
          paint: {
            'fill-extrusion-color': '#1f1f1f',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.75
          }
        },
        labelLayerId
      );
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // 2. Strict 50ms High-Frequency Tracking Execution Cycle (20 Hz)
  useEffect(() => {
    let trackingInterval: NodeJS.Timeout;

    if (isTracking && mapLoaded) {
      trackingInterval = setInterval(() => {
        setCurrentCoords(prev => {
          // Generate sharp localized path vectors mimicking streaming field hardware
          const microDeltaLat = (Math.random() - 0.48) * 0.00007; 
          const microDeltaLon = (Math.random() - 0.50) * 0.00009;
          
          const nextLat = parseFloat((prev.lat + microDeltaLat).toFixed(6));
          const nextLon = parseFloat((prev.lon + microDeltaLon).toFixed(6));

          // Direct imperatively piped Mapbox update bypassing React rendering lags entirely
          if (markerRef.current) {
            markerRef.current.setLngLat([nextLon, nextLat]);
          }

          return { lat: nextLat, lon: nextLon };
        });
        
        setTickCount(t => t + 1);
      }, 50); // Exact 50 millisecond interval clock
    }

    return () => clearInterval(trackingInterval);
  }, [isTracking, mapLoaded]);

  const toggleLayer = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, active: !l.active } : l));
    
    // Toggle actual native Mapbox engine layers
    if (mapRef.current && id === 'mapbox-3d-buildings') {
      const visibility = mapRef.current.getLayoutProperty('3d-buildings', 'visibility');
      mapRef.current.setLayoutProperty(
        '3d-buildings', 
        'visibility', 
        visibility === 'none' ? 'visible' : 'none'
      );
    }
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
          <span className="font-bold text-white tracking-wider uppercase hidden md:inline font-sans">
            StudioOS <span className="text-red-600">Mapbox Pipeline</span>
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

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activePipeline === 'layers' ? (
              <div className="space-y-3">
                <div className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase">Ingested Map Data Vectors</div>
                <div className="space-y-2">
                  {layers.map(layer => (
                    <div key={layer.id} className="p-3 bg-[#141414] border border-[#222222] rounded flex items-start justify-between space-x-3 hover:border-[#333333] transition-colors">
                      <div className="space-y-1">
                        <div className="font-sans font-bold text-white leading-tight">{layer.name}</div>
                        <div className="text-[10px] text-neutral-500">Source: {layer.count}</div>
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
                    <span>MAPBOX ENGINE:</span>
                    <span className="text-green-400 font-bold">WebGL_ACCELERATED</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#131313] border-t border-[#222222] text-[10px] text-neutral-500 font-mono hidden md:block">
            <div className="text-red-600 font-bold mb-0.5">SYSTEM_STREAM_LOG</div>
            <div className="truncate text-neutral-400">&gt; Refresh interval set to strict 50ms pipeline.</div>
            <div className="truncate text-neutral-300">&gt; Frame update executed at tick: {tickCount}</div>
          </div>
        </aside>

        {/* Primary Map Viewport Target Container */}
        <main className="flex-1 relative bg-[#090909]">
          
          {/* Mapbox GL Canvas Mount Target */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Map Loading overlay state */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-[#0A0A0A] z-30 flex flex-col items-center justify-center space-y-2">
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-[10px] tracking-widest text-neutral-500 uppercase">Compiling WebGL Layer...</div>
            </div>
          )}

          {/* Floating Heads-Up Display Telemetry Windows */}
          <div className="absolute top-4 right-4 bg-[#111111]/90 backdrop-blur-md border border-[#222222] p-3 rounded shadow-2xl space-y-1.5 z-10 text-[10px] font-mono text-neutral-400 min-w-[180px]">
            <div className="font-bold text-red-500 uppercase tracking-widest border-b border-[#222222] pb-1 mb-1 text-[9px] flex justify-between">
              <span>ENGINE HUD</span>
              <span className={isTracking ? 'animate-pulse text-red-600' : 'text-neutral-600'}>●</span>
            </div>
            <div>LAT: <span className="text-white font-sans font-bold">{currentCoords.lat}</span></div>
            <div>LON: <span className="text-white font-sans font-bold">{currentCoords.lon}</span></div>
            <div className="border-t border-[#222222] pt-1 mt-1 text-[9px] text-neutral-500">CYCLE: <span className="text-neutral-300">50ms interval</span></div>
          </div>

          {/* Bottom Attribute Features Data Terminal Table */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#111111] border-t border-[#222222] z-10 flex flex-col">
            <div className="px-4 py-2 bg-[#141414] border-b border-[#222222] text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex justify-between items-center">
              <span>Geospatial Feature Attributes Terminal</span>
              <span className="text-[9px] font-mono text-red-500">Live Mapbox delta sync active</span>
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
                    <td className="py-1 text-neutral-400">Ukiah Infrastructure Relay</td>
                    <td className="text-neutral-500">39.1502° N, -123.2078° W</td>
                    <td className="text-neutral-600">Static Base Bind</td>
                    <td className="text-neutral-500">STANDBY</td>
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
