import { createSignal, onCleanup } from "solid-js";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const useUserLocation = () => {
  const [location, setLocation] = createSignal<UserLocation | undefined>();
  const [error, setError] = createSignal<string | undefined>();
  const [loading, setLoading] = createSignal(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(undefined);

    const successHandler = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
      setLoading(false);
    };

    const errorHandler = (positionError: GeolocationPositionError) => {
      let message = "Unable to retrieve your location";
      if (positionError.code === 1) {
        message = "Permission to access location was denied";
      } else if (positionError.code === 2) {
        message = "Location information is unavailable";
      } else if (positionError.code === 3) {
        message = "The request to get user location timed out";
      }
      setError(message);
      setLoading(false);
    };

    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    onCleanup(() => {
      navigator.geolocation.clearWatch(watchId);
    });
  };

  return {
    location,
    error,
    loading,
    requestLocation,
  };
};
