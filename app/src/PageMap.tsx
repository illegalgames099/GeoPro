import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import LayersPanel from './LayersPanel';
import PlaceSearch from './PlaceSearch';
import DirectionsPanel from './DirectionsPanel';
import FeatureTable from './FeatureTable';
import 'maplibre-gl/dist/maplibre-gl.css';

// Initialize the PMTiles protocol handler globally
const pmtilesProtocol = new Protocol();
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

export default function PageMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  // UI Panel Visibility State
  const [activePanel, setActivePanel] = useState<'layers' | 'directions' | null>('layers');
  const [showTable, setShowTable] = useState<boolean>(true);
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);
  const [visibleLayers, setVisibleLayers] = useState({
    buildings: true,
    roads: true,
    infrastructure: true,
    terrain: true,
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map view on default California regional nexus coordinates
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'basemap-tiles': {
            type: 'vector',
            url: 'pmtiles://https://protomaps.github.io/basemaps-assets/tiles/v3/cloudigallames.pmtiles',
            attribution: '© OpenStreetMap contributors, Overture Maps, Protomaps',
          },
          'local-terrain': {
            type: 'raster-dem',
            tiles: ['https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 14
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#0a0a0c' },
          },
          {
            id: 'roads',
            type: 'line',
            source: 'basemap-tiles',
            'source-layer': 'roads',
            paint: {
              'line-color': '#1f1f23',
              'line-width': ['step', ['zoom'], 1, 13, 2, 15, 4],
            },
          },
          {
            id: 'buildings',
            type: 'fill-extrusion',
            source: 'basemap-tiles',
            'source-layer': 'buildings',
            paint: {
              'fill-extrusion-color': '#141416',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.85,
            },
          },
        ],
      },
      center: [-123.2078, 39.1502], // Default regional center
      zoom: 13.5,
      pitch: 45,
      bearing: 0,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      mapRef.current = map;
      
      // Interactive vector target click handlers
      map.on('click', 'buildings', (e) => {
        if (e.features && e.features.length > 0) {
          setSelectedFeatures(e.features.map(f => ({
            id: f.id || Math.random().toString(),
            layer: f.layer.id,
            properties: f.properties
          })));
        }
      });
    });

    return () => map.remove();
  }, []);

  // Layer state visibility synchronization
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const toggle = (id: string, visible: boolean) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    };

    toggle('buildings', visibleLayers.buildings);
    toggle('roads', visibleLayers.roads);
  }, [visibleLayers]);

  const handleFlyTo = (coords: [number, number], zoom: number = 15) => {
    mapRef.current?.flyTo({ center: coords, zoom, speed: 1.2, pitch: 50 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#0a0a0c', color: '#f4f4f5', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* Top Controls Action Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: '#111114', borderBottom: '2px solid #851414', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#e51a1a', borderRadius: '2px', boxShadow: '0 0 8px #e51a1a' }} />
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', tracking: '0.05em', color: '#ffffff', margin: 0 }}>GEOPRO DASHBOARD</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActivePanel(activePanel === 'layers' ? null : 'layers')} style={{ backgroundColor: activePanel === 'layers' ? '#27272a' : '#18181b', color: activePanel === 'layers' ? '#e51a1a' : '#a1a1aa', border: '1px solid #3f3f46', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>Layers</button>
          <button onClick={() => setActivePanel(activePanel === 'directions' ? null : 'directions')} style={{ backgroundColor: activePanel === 'directions' ? '#27272a' : '#18181b', color: activePanel === 'directions' ? '#e51a1a' : '#a1a1aa', border: '1px solid #3f3f46', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>Routing</button>
          <button onClick={() => setShowTable(!showTable)} style={{ backgroundColor: showTable ? '#27272a' : '#18181b', color: showTable ? '#e51a1a' : '#a1a1aa', border: '1px solid #3f3f46', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>Data Inspector</button>
        </div>
      </div>

      {/* Primary Workspace Viewport Container */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Render Engine Canvas Anchor */}
        <div ref={mapContainerRef} style={{ flex: 1, height: '100%' }} />

        {/* Global Search Interface overlay */}
        <PlaceSearch onNavigate={handleFlyTo} />

        {/* Floating Lateral Panel Stack */}
        {activePanel === 'layers' && (
          <LayersPanel visibleLayers={visibleLayers} setVisibleLayers={setVisibleLayers} />
        )}
        {activePanel === 'directions' && (
          <DirectionsPanel onGenerateRoute={(start, end) => handleFlyTo(start, 14)} />
        )}

        {/* Bottom Collapsible Property Attribute Sheet */}
        {showTable && (
          <FeatureTable features={selectedFeatures} onClose={() => setShowTable(false)} />
        )}
      </div>
    </div>
  );
}
