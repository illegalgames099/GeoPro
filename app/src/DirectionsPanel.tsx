import { createSignal, Show, For } from "solid-js";

export interface Direction {
  instruction: string;
  distance: number;
  duration: number;
}

interface Props {
  origin: [number, number] | undefined;
  destination: [number, number] | undefined;
  onDirectionsUpdate?: (directions: Direction[]) => void;
}

export const DirectionsPanel = (props: Props) => {
  const [directions, setDirections] = createSignal<Direction[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [distance, setDistance] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [error, setError] = createSignal<string | undefined>();

  const fetchDirections = async () => {
    if (!props.origin || !props.destination) return;

    setLoading(true);
    setError(undefined);

    try {
      const coords = `${props.origin[0]},${props.origin[1]};${props.destination[0]},${props.destination[1]}`;
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${
          import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ""
        }&steps=true&geometries=geojson&overview=simplified`
      );

      if (!response.ok) throw new Error("Directions request failed");

      const data = await response.json();
      const route = data.routes?.[0];

      if (!route) {
        setError("No route found");
        return;
      }

      setDistance(Math.round(route.distance / 1000 * 10) / 10); // km
      setDuration(Math.round(route.duration / 60)); // minutes

      const directionsList: Direction[] = [];
      route.legs.forEach((leg: any) => {
        leg.steps.forEach((step: any) => {
          directionsList.push({
            instruction: step.maneuver?.instruction || "Continue",
            distance: Math.round(step.distance),
            duration: Math.round(step.duration),
          });
        });
      });

      setDirections(directionsList);
      props.onDirectionsUpdate?.(directionsList);
    } catch (err) {
      console.error("Error fetching directions:", err);
      setError(err instanceof Error ? err.message : "Failed to get directions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Directions
      </h3>

      <Show when={props.origin && props.destination}>
        <button
          onClick={fetchDirections}
          disabled={loading()}
          class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold mb-4"
        >
          {loading() ? "Getting Directions..." : "Get Directions"}
        </button>
      </Show>

      <Show when={error()}>
        <div class="text-red-500 text-sm mb-4">{error()}</div>
      </Show>

      <Show when={distance() > 0}>
        <div class="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Distance:</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {distance()} km
            </span>
          </div>
          <div class="flex justify-between text-sm mt-2">
            <span class="text-gray-600 dark:text-gray-400">Duration:</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {duration()} min
            </span>
          </div>
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Turn-by-Turn Directions
          </div>
          <For each={directions()}>
            {(direction, index) => (
              <div class="flex gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold text-xs">
                  {index() + 1}
                </div>
                <div class="flex-1">
                  <div class="text-gray-900 dark:text-white">
                    {direction.instruction}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {direction.distance}m • {Math.round(direction.duration)}s
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={!props.origin || !props.destination}>
        <div class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Select both origin and destination to get directions
        </div>
      </Show>
    </div>
  );
};
