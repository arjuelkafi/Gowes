import { useEffect } from 'react';
import {
  APIProvider,
  Map as GMap,
  AdvancedMarker,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import { Clock, Images, User, ChevronRight } from 'lucide-react';
import { LocationSpot } from '../types';
import { formatWIB } from '../utils/formatters';

interface MapProps {
  spots: LocationSpot[];
  activePopupSpot: LocationSpot | null;
  onSetPopupSpot: (spot: LocationSpot | null) => void;
  onOpenDetail: (spot: LocationSpot) => void;
  userLocation: { lat: number; lng: number } | null;
  targetFocusLocation?: { lat: number; lng: number; zoom?: number } | null;
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
}

const INDONESIA_BOUNDS = {
  north: 6.5,
  south: -11.5,
  west: 94.5,
  east: 141.5
};

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCjUFE8atX5Bnkqrf61Mcw72rRZR4pol10';

// Clean, high-contrast, nature-friendly outdoor cycling color palette
const CYCLING_MAP_STYLES = [
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#718096' }, { weight: 1.5 }]
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#a0aec0' }, { weight: 1 }]
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1a202c' }, { weight: 'bold' }]
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 3 }]
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ebf4ea' }]
  },
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#cde7c5' }]
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi.attraction',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#97d2eb' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2b6cb0' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d2d6dc' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fcd34d' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f59e0b' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.fill',
    stylers: [{ color: '#f7fafc' }]
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'simplified' }]
  }
];

// Controller component to smoothly pan and zoom map camera
function MapCameraController({
  userLocation,
  targetFocusLocation
}: {
  userLocation: { lat: number; lng: number } | null;
  targetFocusLocation?: { lat: number; lng: number; zoom?: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (map && targetFocusLocation) {
      map.panTo({ lat: targetFocusLocation.lat, lng: targetFocusLocation.lng });
      map.setZoom(targetFocusLocation.zoom || 14);
    }
  }, [map, targetFocusLocation]);

  useEffect(() => {
    if (map && userLocation && !targetFocusLocation) {
      map.panTo(userLocation);
      map.setZoom(15);
    }
  }, [map, userLocation, targetFocusLocation]);

  return null;
}

export default function Map({
  spots,
  activePopupSpot,
  onSetPopupSpot,
  onOpenDetail,
  userLocation,
  targetFocusLocation,
  isPickingLocation,
  pickedLocation,
  onPickLocation
}: MapProps) {
  return (
    <div
      className={`relative w-full h-full bg-neutral-900 ${
        isPickingLocation ? 'cursor-crosshair' : ''
      }`}
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <GMap
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={{ lat: -7.2, lng: 110.5 }}
          defaultZoom={7}
          minZoom={5}
          maxZoom={18}
          mapTypeId="terrain"
          gestureHandling="greedy"
          styles={CYCLING_MAP_STYLES}
          restriction={{
            latLngBounds: INDONESIA_BOUNDS,
            strictBounds: true
          }}
          mapTypeControl={true}
          mapTypeControlOptions={{
            mapTypeIds: ['terrain', 'roadmap', 'hybrid'],
            position: 3
          }}
          zoomControl={true}
          zoomControlOptions={{
            position: 9
          }}
          streetViewControl={false}
          fullscreenControl={false}
          className="w-full h-full"
          onClick={(e) => {
            let lat: number | undefined;
            let lng: number | undefined;
            if (e.detail.latLng) {
              const ll = e.detail.latLng as unknown as {
                lat: number | (() => number);
                lng: number | (() => number);
              };
              if (typeof ll.lat === 'function') {
                lat = ll.lat();
                lng = (ll.lng as () => number)();
              } else if (typeof ll.lat === 'number') {
                lat = ll.lat;
                lng = ll.lng as number;
              }
            }

            if (
              isPickingLocation &&
              onPickLocation &&
              typeof lat === 'number' &&
              typeof lng === 'number' &&
              !isNaN(lat) &&
              !isNaN(lng)
            ) {
              onPickLocation({ lat, lng });
            } else if (!isPickingLocation) {
              // Clicking anywhere on map closes the preview popup easily
              onSetPopupSpot(null);
            }
          }}
        >
          <MapCameraController
            userLocation={userLocation}
            targetFocusLocation={targetFocusLocation}
          />

          {/* Spots Photo Pins */}
          {spots.map((spot) => {
            const isPopupActive = activePopupSpot?.id === spot.id;
            const spotLat = Number(spot.latitude);
            const spotLng = Number(spot.longitude);
            if (isNaN(spotLat) || isNaN(spotLng)) return null;

            return (
              <AdvancedMarker
                key={spot.id}
                position={{ lat: spotLat, lng: spotLng }}
                onClick={() => {
                  onSetPopupSpot(spot);
                }}
                title={spot.name}
              >
                {/* Photo Pin Element */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPopupSpot(spot);
                  }}
                  className="relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:scale-120"
                  style={{ width: '40px' }}
                >
                  <div
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                      isPopupActive
                        ? 'border-amber-400 ring-2 ring-amber-400 shadow-xl scale-110'
                        : 'border-white shadow-md'
                    } bg-neutral-800 shrink-0`}
                  >
                    <img
                      src={spot.photo_url}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div
                    className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
                      isPopupActive ? 'border-t-amber-400' : 'border-t-white'
                    } -mt-0.5 shadow-sm`}
                  />
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Enhanced Info Window Balloon Popup */}
          {activePopupSpot && (
            <InfoWindow
              position={{
                lat: Number(activePopupSpot.latitude),
                lng: Number(activePopupSpot.longitude)
              }}
              onCloseClick={() => onSetPopupSpot(null)}
              headerDisabled={false}
              pixelOffset={[0, -42]}
            >
              <div className="w-68 p-3 text-neutral-100 bg-neutral-900 space-y-2.5">
                {/* Photo Container */}
                <div className="relative h-36 w-full rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                  <img
                    src={activePopupSpot.photo_url}
                    alt={activePopupSpot.name}
                    className="w-full h-full object-cover"
                  />
                  {activePopupSpot.photos && activePopupSpot.photos.length > 1 && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-3xs font-mono font-medium bg-neutral-950/90 text-neutral-200 border border-neutral-700 flex items-center gap-1 shadow">
                      <Images className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{activePopupSpot.photos.length} Foto</span>
                    </span>
                  )}
                </div>

                {/* Spot Info */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-white tracking-tight leading-snug">
                    {activePopupSpot.name}
                  </h4>

                  <div className="p-2 rounded-md bg-neutral-950 border border-neutral-800">
                    <p className="text-2xs text-neutral-300 italic font-serif leading-relaxed line-clamp-2">
                      "{activePopupSpot.quote}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-3xs text-neutral-400 pt-0.5">
                    <div className="flex items-center gap-1 truncate mr-2">
                      <User className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        {activePopupSpot.photographer_name || 'Pesepeda Anonim'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>
                        {formatWIB(activePopupSpot.captured_at || activePopupSpot.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => onOpenDetail(activePopupSpot)}
                  className="w-full py-2 px-3 text-xs font-semibold text-center text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1 transition shadow cursor-pointer"
                >
                  <span>Lihat Cerita Lengkap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </InfoWindow>
          )}

          {/* Picked Location Marker */}
          {pickedLocation && (
            <AdvancedMarker position={pickedLocation} title="Titik Dipilih">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg animate-bounce">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </AdvancedMarker>
          )}

          {/* User Location Marker */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Posisi Anda">
              <div className="relative flex items-center justify-center">
                <div className="user-pulse-ring" />
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md z-10" />
              </div>
            </AdvancedMarker>
          )}
        </GMap>
      </APIProvider>

      {/* Picking Location Indicator */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-neutral-950/95 border border-neutral-700 text-neutral-200 text-xs font-medium rounded-lg shadow-xl flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span>Klik titik mana pun pada peta untuk menetapkan lokasi spot gowes Anda.</span>
        </div>
      )}
    </div>
  );
}
