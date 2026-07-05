/* @refresh reload */
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css";
import {
  AttributionControl,
  type MapGeoJSONFeature,
  Map as MapboxMap,
  NavigationControl,
  Popup,
  Marker,
  LngLatLike,
} from "mapbox-gl";
import {
  type Accessor,
  type Setter,
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onMount,
} from "solid-js";
import { render } from "solid-js/web";
import "@alenaksu/json-viewer";
import { SphericalMercator } from "@mapbox/sphericalmercator";
import { Protocol } from "pmtiles";
import { FeatureTable } from "./FeatureTable";
import { ExampleChooser, Frame } from "./Frame";
import { type LayerVisibility, LayersPanel } from "./LayersPanel";
import { type Tileset, tilesetFromString } from "./tileset";
import { colorForIdx, createHash, parseHash, tileInspectUrl } from "./utils";
import { useUserLocation } from "./useUserLocation";
import { PlaceSearch, type SearchResult } from "./PlaceSearch";
import { DirectionsPanel } from "./DirectionsPanel";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "json-viewer": unknown;
    }
  }
}

function MapView(props: {
  tileset: Accessor<Tileset>;
  showMetadata: Accessor<boolean>;
  setShowMetadata: Setter<boolean>;
  showTileBoundaries: Accessor<boolean>;
  setShowTileBoundaries: Setter<boolean>;
  inspectFeatures: Accessor<boolean>;
  setInspectFeatures: Setter<boolean>;
  mapHashPassed: boolean;
  iframe: boolean;
}) {
  let mapContainer: HTMLDivElement | undefined;
  let hiddenRef: HTMLDivElement | undefined;
  const [zoom, setZoom] = createSignal<number>(0);
  const [layerVisibility, setLayerVisibility] = createSignal<LayerVisibility[]>(
    []
  );
  const [hoveredFeatures, setHoveredFeatures] = createSignal<
    MapGeoJSONFeature[]
  >([]);
  const [basemap, setBasemap] = createSignal<boolean>(false);
  const [frozen, setFrozen] = createSignal<boolean>(false);
  const [useSatellite, setUseSatellite] = createSignal<boolean>(false);
  const [userLocationMarker, setUserLocationMarker] = createSignal<
    Marker | undefined
  >();
  const [origin, setOrigin] = createSignal<[number, number] | undefined>();
  const [destination, setDestination] = createSignal<
    [number, number] | undefined
  >();
  const [showDirections, setShowDirections] = createSignal(false);
  const [originMarker, setOriginMarker] = createSignal<Marker | undefined>();
  const [destMarker, setDestMarker] = createSignal<Marker | undefined>();

  const { location, error, loading, requestLocation } = useUserLocation();

  const inspectableFeatures = createMemo(() => {
    return hoveredFeatures().map((h) => {
      return {
        layerName: h.sourceLayer || "unknown",
        id: h.id ? (h.id as number) : undefined,
        properties: h.properties,
        type: h._vectorTileFeature.type,
      };
    });
  });

  const popup = new Popup({
    closeButton: false,
    closeOnClick: false,
    maxWidth: "none",
  });

  let map: MapboxMap;
  let initialLoad = true;

  const roundZoom = () => {
    map.zoomTo(Math.round(map.getZoom()));
  };

  const fitToBounds = async () => {
    const bounds = await props.tileset().getBounds();
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { animate: false }
    );
  };

  const fitToUserLocation = () => {
    const loc = location();
    if (loc && map) {
      map.fitBounds(
        [
          [loc.longitude - 0.01, loc.latitude - 0.01],
          [loc.longitude + 0.01, loc.latitude + 0.01],
        ],
        { animate: true }
      );
    }
  };

  const handlePlaceSelect = (result: SearchResult, type: "origin" | "dest") => {
    const coords: [number, number] = [result.longitude, result.latitude];

    if (type === "origin") {
      setOrigin(coords);
      const existing = originMarker();
      if (existing) existing.remove();
      const el = document.createElement("div");
      el.className =
        "w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg";
      const marker = new Marker({ element: el }).setLngLat(coords).addTo(map);
      setOriginMarker(marker);
    } else {
      setDestination(coords);
      const existing = destMarker();
      if (existing) existing.remove();
      const el = document.createElement("div");
      el.className =
        "w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg";
      const marker = new Marker({ element: el }).setLngLat(coords).addTo(map);
      setDestMarker(marker);
    }
  };

  const toggleSatellite = () => {
    if (!map) return;
    const currentStyle = map.getStyle();
    if (useSatellite()) {
      setUseSatellite(false);
      map.setStyle({
        version: 8,
        glyphs:
          "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
        sprite:
          "https://protomaps.github.io/basemaps-assets/sprites/v4/black",
        sources: currentStyle.sources,
        layers: currentStyle.layers,
      });
    } else {
      setUseSatellite(true);
      const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
      map.setStyle(
        `mapbox://styles/mapbox/satellite-v9?access_token=${mapboxAccessToken}`
      );
    }
  };

  const removeTileset = () => {
    for (const layer of map.getStyle().layers) {
      if ("source" in layer && layer.source === "tileset") {
        map.removeLayer(layer.id);
      }
    }
    if ("tileset" in map.getStyle().sources) {
      map.removeSource("tileset");
    }
  };

  const addTileset = async (tileset: Tileset) => {
    const protocol = new Protocol({ metadata: true });
    map.addProtocol("pmtiles", protocol.tile);

    const archiveForProtocol = tileset.archiveForProtocol();
    if (archiveForProtocol) {
      protocol.add(archiveForProtocol);
    }

    let fillOpacity = 0.2;
    let fillHighlightOpacity = 0.4;
    if (await tileset.isOverlay()) {
      setBasemap(true);
      fillOpacity = 0.6;
      fillHighlightOpacity = 0.8;
    }

    if (await tileset.isVector()) {
      map.addSource("tileset", {
        type: "vector",
        url: tileset.getMaplibreSourceUrl(),
        encoding: await tileset.getVectorEncoding(),
      });
      const vectorLayers = await tileset.getVectorLayers();
      setLayerVisibility(vectorLayers.map((v) => ({ id: v, visible: true })));
      for (const [i, vectorLayer] of vectorLayers.entries()) {
        map.addLayer({
          id: `tileset_fill_${vectorLayer}`,
          type: "fill",
          source: "tileset",
          "source-layer": vectorLayer,
          paint: {
            "fill-color": colorForIdx(i),
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              fillHighlightOpacity,
              fillOpacity,
            ],
          },
          filter: ["==", ["geometry-type"], "Polygon"],
        });
        map.addLayer({
          id: `tileset_line_${vectorLayer}`,
          type: "line",
          source: "tileset",
          "source-layer": vectorLayer,
          paint: {
            "line-color": colorForIdx(i),
            "line-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              2,
              0.5,
            ],
          },
          filter: ["==", ["geometry-type"], "LineString"],
        });
        map.addLayer({
          id: `tileset_circle_${vectorLayer}`,
          type: "circle",
          source: "tileset",
          "source-layer": vectorLayer,
          paint: {
            "circle-color": colorForIdx(i),
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              2,
              12,
              4,
            ],
            "circle-opacity": 0.5,
            "circle-stroke-color": "white",
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              3,
              0,
            ],
          },
          filter: ["==", ["geometry-type"], "Point"],
        });
      }
    } else {
      map.addSource("tileset", {
        type: "raster",
        url: tileset.getMaplibreSourceUrl(),
      });
      map.addLayer({
        source: "tileset",
        id: "tileset_raster",
        type: "raster",
        paint: {
          "raster-resampling": "nearest",
        },
      });
    }
  };

  createEffect(() => {
    const tileset = props.tileset();
    if (initialLoad) {
      initialLoad = false;
      return;
    }
    removeTileset();
    addTileset(tileset);
  });

  createEffect(() => {
    const visibility = basemap() ? "visible" : "none";
    if (map) {
      for (const layer of map.getStyle().layers) {
        if ("source" in layer && layer.source === "basemap") {
          map.setLayoutProperty(layer.id, "visibility", visibility);
        }
      }
    }
  });

  createEffect(() => {
    const show = props.showTileBoundaries();
    if (map) {
      map.showTileBoundaries = show;
    }
  });

  createEffect(() => {
    if (props.inspectFeatures()) {
      setFrozen(false);
    } else {
      for (const hoveredFeature of hoveredFeatures()) {
        if (hoveredFeature.id === undefined) continue;
        map.setFeatureState(hoveredFeature, { hover: false });
      }
      popup.remove();
    }
  });

  createEffect(() => {
    const setVisibility = (layerName: string, visibility: string) => {
      if (map.getLayer(layerName)) {
        map.setLayoutProperty(layerName, "visibility", visibility);
      }
    };

    for (const { id, visible } of layerVisibility()) {
      const visibility = visible ? "visible" : "none";
      setVisibility(`tileset_fill_${id}`, visibility);
      setVisibility(`tileset_line_${id}`, visibility);
      setVisibility(`tileset_circle_${id}`, visibility);
    }
  });

  createEffect(() => {
    const loc = location();
    if (loc && map) {
      let marker = userLocationMarker();
      if (!marker) {
        const el = document.createElement("div");
        el.className =
          "w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg";
        marker = new Marker({ element: el, anchor: "center" });
        setUserLocationMarker(marker);
      }
      marker.setLngLat([loc.longitude, loc.latitude]).addTo(map);
    }
  });

  onMount(async () => {
    if (!mapContainer) {
      console.error("Could not mount map element");
      return;
    }

    const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
    if (!mapboxAccessToken) {
      console.warn(
        "Mapbox access token not found. Set VITE_MAPBOX_ACCESS_TOKEN environment variable."
      );
    }

    map = new MapboxMap({
      accessToken: mapboxAccessToken,
      container: mapContainer,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.5, 40],
      zoom: 9,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({}), "top-left");
    map.addControl(new AttributionControl({ compact: false }), "bottom-right");

    if (!props.mapHashPassed) {
      fitToBounds();
    }

    if (props.showTileBoundaries()) {
      map.showTileBoundaries = true;
    }

    setZoom(map.getZoom());
    map.on("zoom", (e) => {
      setZoom(e.target.getZoom());
    });

    map.on("load", async () => {
      await addTileset(props.tileset());
      map.resize();
    });
  });

  return (
    <div class="flex flex-col md:flex-row w-full h-full bg-gray-100 dark:bg-gray-900">
      <div class="md:w-96 bg-white dark:bg-gray-800 shadow-lg p-4 overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          GeoPro Navigator
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              From
            </label>
            <PlaceSearch
              onSelect={(result) => handlePlaceSelect(result, "origin")}
            />
            <Show when={origin()}>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {origin()?.[1].toFixed(4)}, {origin()?.[0].toFixed(4)}
              </div>
            </Show>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              To
            </label>
            <PlaceSearch
              onSelect={(result) => handlePlaceSelect(result, "dest")}
            />
            <Show when={destination()}>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {destination()?.[1].toFixed(4)}, {destination()?.[0].toFixed(4)}
              </div>
            </Show>
          </div>

          <Show when={origin() && destination()}>
            <button
              onClick={() => setShowDirections(!showDirections())}
              class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
            >
              {showDirections() ? "Hide" : "Show"} Directions
            </button>
          </Show>

          <Show when={showDirections()}>
            <DirectionsPanel
              origin={origin()}
              destination={destination()}
            />
          </Show>

          <hr class="border-gray-300 dark:border-gray-600" />

          <div class="space-y-2">
            <button
              onClick={() => setShowDirections(!showDirections())}
              class="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg"
            >
              🛰️ {useSatellite() ? "Street" : "Satellite"} View
            </button>

            <Show when={!location()}>
              <button
                onClick={requestLocation}
                disabled={loading()}
                class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg"
              >
                {loading() ? "Getting location..." : "📍 Use My Location"}
              </button>
            </Show>

            <Show when={location()}>
              <button
                onClick={fitToUserLocation}
                class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg"
              >
                🎯 Go to My Location
              </button>
            </Show>

            <Show when={error()}>
              <div class="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                {error()}
              </div>
            </Show>
          </div>
        </div>
      </div>

      <div class="flex-1 relative">
        <div
          ref={mapContainer}
          classList={{
            "h-full": true,
            "w-full": true,
          }}
        />
      </div>
    </div>
  );
}

function PageMap() {
  let hash = parseHash(location.hash);

  const href = new URL(window.location.href);
  const queryParamUrl = href.searchParams.get("url");
  if (queryParamUrl) {
    href.searchParams.delete("url");
    history.pushState(null, "", href.toString());
    location.hash = createHash(location.hash, {
      url: queryParamUrl,
      map: hash.map,
    });
    hash = parseHash(location.hash);
  }
  const iframe = hash.iframe === "true";

  const mapHashPassed = hash.map !== undefined;
  const [tileset, setTileset] = createSignal<Tileset | undefined>(
    hash.url ? tilesetFromString(decodeURIComponent(hash.url)) : undefined
  );
  const [showMetadata, setShowMetadata] = createSignal<boolean>(
    hash.showMetadata === "true" || false
  );
  const [showTileBoundaries, setShowTileBoundaries] = createSignal<boolean>(
    hash.showTileBoundaries === "true"
  );
  const [inspectFeatures, setInspectFeatures] = createSignal<boolean>(
    hash.inspectFeatures === "true"
  );

  createEffect(() => {
    const t = tileset();
    const stateUrl = t?.getStateUrl();
    location.hash = createHash(location.hash, {
      url: stateUrl ? encodeURIComponent(stateUrl) : undefined,
      showMetadata: showMetadata() ? "true" : undefined,
      showTileBoundaries: showTileBoundaries() ? "true" : undefined,
      inspectFeatures: inspectFeatures() ? "true" : undefined,
    });
  });

  return (
    <Frame tileset={tileset} setTileset={setTileset} page="map" iframe={iframe}>
      <Show
        when={tileset()}
        fallback={<ExampleChooser setTileset={setTileset} />}
      >
        {(t) => (
          <MapView
            tileset={t}
            showMetadata={showMetadata}
            setShowMetadata={setShowMetadata}
            showTileBoundaries={showTileBoundaries}
            setShowTileBoundaries={setShowTileBoundaries}
            inspectFeatures={inspectFeatures}
            setInspectFeatures={setInspectFeatures}
            mapHashPassed={mapHashPassed}
            iframe={iframe}
          />
        )}
      </Show>
    </Frame>
  );
}

const root = document.getElementById("root");

if (root) {
  render(() => <PageMap />, root);
}
