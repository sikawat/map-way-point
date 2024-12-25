import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Waypoint {
  latitude: number;
  longitude: number;
}

interface MapProps {
  waypoints: Waypoint[];
  isAddingWaypoint: boolean;
  isEditingWaypoint: boolean;
  isDeletingWaypoint: boolean; // New prop
  onAddWaypoint: (waypoint: Waypoint) => void;
  onUpdateWaypoint: (index: number, updatedWaypoint: Waypoint) => void;
  onDeleteWaypoint: (index: number) => void; // New prop
  initialCenter: Waypoint; // New prop
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

const Map: React.FC<MapProps> = ({
  waypoints,
  isAddingWaypoint,
  isEditingWaypoint,
  isDeletingWaypoint, // New prop
  onAddWaypoint,
  onUpdateWaypoint,
  onDeleteWaypoint, // New prop
  initialCenter, // New prop
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const isAddingWaypointRef = useRef(isAddingWaypoint);
  const isDeletingWaypointRef = useRef(isDeletingWaypoint);
  const currentWaypoints = useRef<Waypoint[]>(waypoints);

  useEffect(() => {
    isAddingWaypointRef.current = isAddingWaypoint;
    console.log('isAddingWaypoint in Map.tsx updated to:', isAddingWaypoint);
  }, [isAddingWaypoint]);

  useEffect(() => {
    isDeletingWaypointRef.current = isDeletingWaypoint;
    console.log('isDeletingWaypoint in Map.tsx updated to:', isDeletingWaypoint);
  }, [isDeletingWaypoint]);

  useEffect(() => {
    currentWaypoints.current = waypoints;
  }, [waypoints]);

  const handleMapClick = useCallback(
    (event: mapboxgl.MapMouseEvent) => {
      if (isAddingWaypointRef.current) {
        const { lng, lat } = event.lngLat;
        console.log('Map clicked:', { latitude: lat, longitude: lng });
        onAddWaypoint({ latitude: lat, longitude: lng });
      }
    },
    [onAddWaypoint]
  );

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      console.log('Initializing map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [initialCenter.longitude, initialCenter.latitude], // Use initialCenter
        zoom: 12, // Adjust zoom level for Bangkok
      });

      map.current.on('click', handleMapClick);

      // Optional: Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());
    }
  }, [handleMapClick, initialCenter]);

  const updateLineSource = (updatedWaypoints: Waypoint[]) => {
    if (!map.current) return;

    const coordinates = updatedWaypoints.map((wp) => [wp.longitude, wp.latitude]);

    if (map.current.getSource('waypoints-line')) {
      (map.current.getSource('waypoints-line') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
            properties: {},
          },
        ],
      });
    } else {
      map.current.addSource('waypoints-line', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: coordinates,
              },
              properties: {},
            },
          ],
        },
      });

      map.current.addLayer({
        id: 'waypoints-line',
        type: 'line',
        source: 'waypoints-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
        },
      });
    }
  };

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) {
      console.log('Mapbox style is not yet fully loaded.');
      return;
    }

    console.log('Updating markers and lines for waypoints:', waypoints);

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    waypoints.forEach((waypoint, index) => {
      const el = document.createElement('div');
      el.className =
        'flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-sm font-bold cursor-pointer';
      el.textContent = (index + 1).toString();

      const marker = new mapboxgl.Marker({
        element: el,
        draggable: isEditingWaypoint,
      })
        .setLngLat([waypoint.longitude, waypoint.latitude])
        .addTo(map.current!);

      if (isDeletingWaypoint) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent map click event
          console.log('Deleting waypoint at index:', index);
          onDeleteWaypoint(index);
        });
      }

      if (isEditingWaypoint) {
        marker.on('drag', () => {
          const lngLat = marker.getLngLat();
          const updatedWaypoint = { latitude: lngLat.lat, longitude: lngLat.lng };
          console.log(`Waypoint at index ${index} is being dragged to:`, updatedWaypoint);

          // Update line dynamically
          updateLineSource(
            currentWaypoints.current.map((wp, i) =>
              i === index ? updatedWaypoint : wp
            )
          );
        });

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          const updatedWaypoint = { latitude: lngLat.lat, longitude: lngLat.lng };
          console.log(`Waypoint at index ${index} drag ended at:`, updatedWaypoint);

          // Trigger onUpdateWaypoint for App.tsx
          onUpdateWaypoint(index, updatedWaypoint);
        });
      }

      markers.current.push(marker);
    });

    updateLineSource(waypoints);
  }, [waypoints, isEditingWaypoint, isDeletingWaypoint, onDeleteWaypoint, onUpdateWaypoint]);

  return <div ref={mapContainer} className="h-full w-full" />;
};

export default Map;