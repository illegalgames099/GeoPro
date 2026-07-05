import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Importing your layout panels
import PlaceSearch from './PlaceSearch';
import LayersPanel from './LayersPanel';
import DirectionsPanel from './DirectionsPanel';
import FeatureTable from './FeatureTable';

// Authenticated Mapbox production access token
mapboxgl.accessToken = 'pk.eyJ1IjoiamFja2Fsb3BlcGxheXMiLCJhIjoiY21ubmppMnQ0MXV5cTJycHB6NzI2Z3ozaSJ9.rC3Z3wHDO5qKVLdiA9XlLg';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  type: 'vector' | 'raster' | 'geojson';
}

export default function PageMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState<'layers' | 'directions' | 'search'>('layers');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 50ms Telemetry Stream Engine States
  const [isTracking, setIsTracking] = useState(true);
  const [currentCoords, setCurrentCoords] = useState({ lat: 39.1502, lon: -123.2078 }); // Ukiah, CA base anchor
  const [tickCount, setTickCount] = useState(0);

  // Layer configurations state
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'basemap', name: 'Standard Terrain Base', visible: true, type: 'raster' },
    { id: 'buildings', name: '3D Buildings (Overture/OSM)', visible: true, type: 'vector' },
    { id: 'roads', name: 'Transportation Network', visible: true, type: 'vector' },
    { id: 'custom-pmtiles', name: 'Local Infrastructure PMTiles', visible: false, type: 'vector' },
  ]);

  // 1. Initialize Mapbox GL Native Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // High-fidelity dark layer configuration
      center: [-123.2078, 39.1502],
      zoom: 14.5,
      pitch: 45,
      bearing: -15,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // Construct a premium brand-specific DOM element for high-frequency coordinate tracking
      const el = document.createElement('div');
      el.className = 'telemetry-ping';
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.backgroundColor = '#dc2626'; // High-visibility engine red
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #ffffff';
      el.style.boxShadow = '0 0 12px #dc2626, 0 0 4px #000000';
      el.style.transition = 'transform 0.03s linear'; // Prevents rendering stutter at 20Hz

      const marker = new mapboxgl.Marker(el)
        .setLngLat([-123.2078, 39.1502])
        .addTo(map);

      markerRef.current = marker;

      // Inject Mapbox 3D Extrusion Mesh directly beneath structural text layers
      const styleLayers = map.getStyle().layers;
      const labelLayerId = styleLayers?.find(layer => layer.type === 'symbol' && layer.layout?.['text-field'])?.id;

      map.addLayer(
        {
          id: '3d-buildings-extrusion',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 12,
          paint: {
            'fill-extrusion-color': '#1a1a1a',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.85
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

  // 2. High-Frequency 50ms Polling Loop (20 Hz Processing Matrix)
  useEffect(() => {
    let trackingInterval: NodeJS.Timeout;

    if (isTracking && mapLoaded) {
      trackingInterval = setInterval(() => {
        setCurrentCoords(prev => {
          // Generate precise, sub-meter trajectory modifications
          const microDeltaLat = (Math.random() - 0.47) * 0.00006; 
          const microDeltaLon = (Math.random() - 0.51) * 0.00008;
          
          const nextLat = parseFloat((prev.lat + microDeltaLat).toFixed(6));
          const nextLon = parseFloat((prev.lon + microDeltaLon).toFixed(6));

          // Imperatively shift the Mapbox marker to avoid triggering global React state redraws
          if (markerRef.current) {
            markerRef.current.setLngLat([nextLon, nextLat]);
          }

          return { lat: nextLat, lon: nextLon };
        });
        
        setTickCount(t => t + 1);
      }, 50);
    }

    return () => clearInterval(trackingInterval);
  }, [isTracking, mapLoaded]);

  const toggleLayerVisibility = (id: string) => {
    setLayers(prevLayers => prevLayers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
    
    // Wire reactive triggers back to the native WebGL map layer states
    if (mapRef.current && id === 'buildings') {
      const visibility = mapRef.current.getLayoutProperty('3d-buildings-extrusion', 'visibility');
      mapRef.current.setLayoutProperty(
        '3d-buildings-extrusion', 
        'visibility', 
        visibility === 'none' ? 'visible' : 'none'
      );
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0A0A0A] text-neutral-200 font-mono text-xs overflow-hidden flex flex-col pt-14 selection:bg-red-600 selection:text-white">
      
      {/* Top Navigation Control Bar */}
      <div className="h-12 bg-[#111111] border-b border-[#222222] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-white tracking-wider uppercase font-sans">
            GeoPro <span className="text-red-600">Engine Terminal</span>
          </span>
          <div className="h-4 w-px bg-[#222222] hidden sm:block"></div>
          <div className="hidden sm:block">
            <PlaceSearch onPlaceSelect={(coords) => {
              console.log('Pan to:', coords);
              if (mapRef.current) mapRef.current.flyTo({ center: [coords.lon, coords.lat], zoom: 16 });
            }} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`px-3 py-1.5 border rounded text-[10px] uppercase font-semibold tracking-wider transition-colors duration-200 ${
              isTracking ? 'bg-red-950/30 border-red-600 text-red-400' : 'bg-[#222222] border-[#333333] text-neutral-400'
            }`}
          >
            {isTracking ? '● 50ms Matrix Active' : '|| Stream Paused'}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="px-3 py-1.5 bg-[#222222] hover:bg-red-700 hover:text-white border border-[#333333] rounded text-[10px] uppercase font-semibold tracking-wider transition-colors duration-200"
          >
            {isSidebarOpen ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <div className="flex flex-1 relative overflow-hidden flex-col md:flex-row">
        
        {/* Dynamic Sidebar Controls */}
        {isSidebarOpen && (
          <aside className="w-full md:w-80 bg-[#0F0F0F] border-b md:border-b-0 md:border-r border-[#222222] flex flex-col shrink-0 z-20">
            {/* Tab Selection Headers */}
            <div className="flex bg-[#141414] border-b border-[#222222] text-[10px] font-bold uppercase tracking-wider">
              <button 
                onClick={() => setActivePanel('layers')} 
                className={`flex-1 py-3 text-center transition-all ${activePanel === 'layers' ? 'text-red-500 border-b-2 border-red-600 bg-[#161616]' : 'text-neutral-400 hover:text-white'}`}
              >
                Layers
              </button>
              <button 
                onClick={() => setActivePanel('directions')} 
                className={`flex-1 py-3 text-center transition-all ${activePanel === 'directions' ? 'text-red-500 border-b-2 border-red-600 bg-[#161616]' : 'text-neutral-400 hover:text-white'}`}
              >
                Routing
              </button>
            </div>

            {/* Panel Views Content Context */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activePanel === 'layers' && (
                <LayersPanel layers={layers} onToggleLayer={toggleLayerVisibility} />
              )}
              {activePanel === 'directions' && (
                <DirectionsPanel onGetRoute={(start, end) => console.log('Route requested:', start, end)} />
              )}
            </div>

            {/* Bottom Diagnostics / Status Foot */}
            <div className="p-3 bg-[#131313] border-t border-[#222222] text-[10px] text-neutral-500 flex justify-between font-mono">
              <span>Status: <span className={mapLoaded ? 'text-green-400' : 'text-amber-500'}>{mapLoaded ? 'MAP_READY' : 'INITIALIZING'}</span></span>
              <span>EPSG:3857</span>
            </div>
          </aside>
        )}

        {/* Core Map Viewport Container */}
        <main className="flex-1 relative bg-[#090909]">
          
          {/* Mapbox Canvas Container */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Map Overlay Loading State */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-[#0A0A0A] z-30 flex flex-col items-center justify-center space-y-2">
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-[10px] tracking-widest text-neutral-500 uppercase">Loading Geospatial Engine...</div>
            </div>
          )}

          {/* Floating Map HUD Utilities */}
          {mapLoaded && (
            <div className="absolute top-4 right-4 bg-[#111111]/90 backdrop-blur-md border border-[#222222] p-3 rounded shadow-2xl space-y-1 z-10 text-[10px] font-mono text-neutral-400 min-w-[160px]">
              <div className="font-bold text-red-500 uppercase tracking-widest border-b border-[#222222] pb-1 mb-1.5 text-[9px]">HUD Diagnostics</div>
              <div>Lat: <span className="text-white font-sans">{currentCoords.lat}° N</span></div>
              <div>Lon: <span className="text-white font-sans">{currentCoords.lon}° W</span></div>
              <div>Ticks: <span className="text-neutral-300 font-sans">{tickCount}</span></div>
            </div>
          )}

          {/* Collapsible Feature/Attribute Table Panel */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#111111] border-t border-[#222222] z-10 flex flex-col">
            <FeatureTable />
          </div>

        </main>
      </div>
    </div>
  );
}
