export async function fetchRouteFromAPI(stops) {
  const url =
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: import.meta.env.VITE_REACT_APP_ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: stops.map((stop) => [stop.lon, stop.lat]),
      }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.features[0].geometry.coordinates.map(([lon, lat]) => [
      lat,
      lon,
    ]);
  } catch (err) {
    console.error("Error fetching route:", err);
    return [];
  }
}

export async function fetchUserToStart(userLocation, selectedStops) {
  const url =
    "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: import.meta.env.VITE_REACT_APP_ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [userLocation[1], userLocation[0]],
          [selectedStops[0].lon, selectedStops[0].lat],
        ],
      }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.features[0].geometry.coordinates.map(([lon, lat]) => [
      lat,
      lon,
    ]);
  } catch (err) {
    return [];
  }
}
