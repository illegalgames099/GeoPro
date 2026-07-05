import { createSignal, Show } from "solid-js";

export interface SearchResult {
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  description?: string;
}

interface Props {
  onSelect: (result: SearchResult) => void;
}

export const PlaceSearch = (props: Props) => {
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<SearchResult[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [open, setOpen] = createSignal(false);

  const searchPlaces = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Using Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${
          import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ""
        }`
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      const searchResults: SearchResult[] = (data.features || []).map(
        (feature: any) => ({
          name: feature.text,
          latitude: feature.center[1],
          longitude: feature.center[0],
          type: feature.place_type?.[0] || "place",
          description: feature.place_name,
        })
      );

      setResults(searchResults);
      setOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    props.onSelect(result);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div class="relative w-full">
      <div class="flex gap-2">
        <input
          type="text"
          placeholder="Search places..."
          value={query()}
          onInput={(e) => {
            const q = e.currentTarget.value;
            setQuery(q);
            if (q.length > 2) {
              searchPlaces(q);
            } else {
              setResults([]);
            }
          }}
          class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Show when={open() && results().length > 0}>
        <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {results().map((result) => (
            <button
              type="button"
              onClick={() => handleSelect(result)}
              class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-sm"
            >
              <div class="font-semibold text-gray-900 dark:text-white">
                {result.name}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {result.description}
              </div>
            </button>
          ))}
        </div>
      </Show>

      <Show when={loading()}>
        <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400">
          Searching...
        </div>
      </Show>
    </div>
  );
};
