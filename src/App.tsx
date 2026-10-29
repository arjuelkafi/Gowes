import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Bike,
  Search,
  Plus,
  Navigation,
  Layers,
  MapPin,
  List,
  Map as MapIcon,
  X,
  Compass,
  AlertCircle,
  Building2,
  ChevronRight
} from 'lucide-react';
import Map from './components/Map';
import SpotDetailModal from './components/SpotDetailModal';
import UploadModal from './components/UploadModal';
import ReportModal from './components/ReportModal';
import SpotCard from './components/SpotCard';
import { LocationSpot, CreateSpotDto } from './types';
import { INITIAL_SPOTS } from './data/initialSpots';
import {
  INDONESIA_REGENCIES,
  findRegency,
  RegencyLocation
} from './utils/kabupatenData';

export default function App() {
  const [spots, setSpots] = useState<LocationSpot[]>(INITIAL_SPOTS);
  const [activePopupSpot, setActivePopupSpot] = useState<LocationSpot | null>(null);
  const [modalDetailSpot, setModalDetailSpot] = useState<LocationSpot | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reportTargetSpot, setReportTargetSpot] = useState<LocationSpot | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Map camera focus state (directs to Kabupaten, Spot, or User)
  const [targetFocusLocation, setTargetFocusLocation] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);

  // GPS user position state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Pick location on map state
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Mobile layout view toggle ('map' | 'list')
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Google Maps Quota state
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Fetch spots from backend API
  const fetchSpots = useCallback(async () => {
    try {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSpots(json.data);
          return;
        }
      }
    } catch {
      // Fallback
    }

    const cached = localStorage.getItem('gowesmap_spots');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSpots(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }
    setSpots(INITIAL_SPOTS);
  }, []);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  // Sync to local cache
  useEffect(() => {
    if (spots.length > 0) {
      localStorage.setItem('gowesmap_spots', JSON.stringify(spots));
    }
  }, [spots]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered spots by search query
  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) return spots;
    const q = searchQuery.toLowerCase().trim();
    return spots.filter(
      (spot) =>
        spot.name.toLowerCase().includes(q) ||
        spot.quote.toLowerCase().includes(q) ||
        (spot.description && spot.description.toLowerCase().includes(q))
    );
  }, [spots, searchQuery]);

  // Dynamic suggestions for search bar (Regencies & Spots)
  const regencySuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return INDONESIA_REGENCIES.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.province.toLowerCase().includes(q) ||
        r.aliases?.some((a) => a.includes(q) || q.includes(a))
    ).slice(0, 4);
  }, [searchQuery]);

  const spotSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return spots
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 3);
  }, [spots, searchQuery]);

  // Handle selecting a regency from suggestions or search
  const handleSelectRegency = (regency: RegencyLocation) => {
    setSearchQuery(regency.name);
    setShowSearchDropdown(false);
    setTargetFocusLocation({
      lat: regency.lat,
      lng: regency.lng,
      zoom: regency.zoom || 11
    });
    setLocationNotice(`Mengarahkan peta ke ${regency.name}, ${regency.province}.`);
    setTimeout(() => setLocationNotice(null), 3500);
  };

  // Handle selecting a spot from suggestions
  const handleSelectSpotSuggestion = (spot: LocationSpot) => {
    setSearchQuery(spot.name);
    setShowSearchDropdown(false);
    setActivePopupSpot(spot);
    setTargetFocusLocation({
      lat: Number(spot.latitude),
      lng: Number(spot.longitude),
      zoom: 14
    });
    setLocationNotice(`Mengarahkan peta ke spot ${spot.name}.`);
    setTimeout(() => setLocationNotice(null), 3500);
  };

  // Handle search submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setShowSearchDropdown(false);

    // 1. Check if query matches a kabupaten/kota
    const matchedRegency = findRegency(searchQuery);
    if (matchedRegency) {
      handleSelectRegency(matchedRegency);
      return;
    }

    // 2. Check if query matches an existing spot
    const matchedSpot = spots.find((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
    if (matchedSpot) {
      handleSelectSpotSuggestion(matchedSpot);
      return;
    }

    setLocationNotice(`Menampilkan hasil pencarian untuk "${searchQuery}".`);
    setTimeout(() => setLocationNotice(null), 3000);
  };

  // Handle Find My Location with robust GPS
  const handleLocateMe = () => {
    setIsLocatingUser(true);
    setLocationNotice('Mendeteksi posisi GPS perangkat Anda...');

    if (!navigator.geolocation) {
      setIsLocatingUser(false);
      setLocationNotice('Peramban web tidak mendukung akses geolokasi.');
      setTimeout(() => setLocationNotice(null), 3500);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6))
        };
        setUserLocation(coords);
        setTargetFocusLocation({
          lat: coords.lat,
          lng: coords.lng,
          zoom: 15
        });
        setIsLocatingUser(false);
        setLocationNotice('Lokasi GPS Anda berhasil ditemukan.');
        setTimeout(() => setLocationNotice(null), 3000);
      },
      (error) => {
        setIsLocatingUser(false);
        let msg = 'Izin akses GPS tidak diaktifkan.';
        if (error.code === error.TIMEOUT) {
          msg = 'Waktu pencarian sinyal GPS habis.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Informasi lokasi perangkat tidak tersedia saat ini.';
        }
        setLocationNotice(`${msg} Anda dapat menggunakan tombol "Pilih di Peta".`);
        setTimeout(() => setLocationNotice(null), 4000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle Create Spot & Auto Popup
  const handleCreateSpot = async (dto: CreateSpotDto): Promise<boolean> => {
    const lat = Number(dto.latitude);
    const lng = Number(dto.longitude);

    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newSpot: LocationSpot = {
            ...json.data,
            latitude: Number(json.data.latitude),
            longitude: Number(json.data.longitude)
          };
          setSpots((prev) => [newSpot, ...prev]);
          setActivePopupSpot(newSpot);
          setTargetFocusLocation({
            lat: newSpot.latitude,
            lng: newSpot.longitude,
            zoom: 15
          });
          setPickedCoords(null);
          setIsPickingLocation(false);
          setLocationNotice(`Spot "${newSpot.name}" berhasil diunggah dan ditandai di peta!`);
          setTimeout(() => setLocationNotice(null), 4000);
          return true;
        }
      }
    } catch {
      // Local fallback
    }

    const newSpot: LocationSpot = {
      id: 'spot-' + Date.now(),
      name: dto.name,
      quote: dto.quote,
      description: dto.description,
      latitude: lat,
      longitude: lng,
      photo_url: dto.photo_url,
      photos: dto.photos && dto.photos.length > 0 ? dto.photos : [dto.photo_url],
      photographer_name: dto.photographer_name || 'Pesepeda Anonim',
      captured_at: dto.captured_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      likes_count: 0,
      status: 'published'
    };

    setSpots((prev) => [newSpot, ...prev]);
    setActivePopupSpot(newSpot);
    setTargetFocusLocation({
      lat: newSpot.latitude,
      lng: newSpot.longitude,
      zoom: 15
    });
    setPickedCoords(null);
    setIsPickingLocation(false);
    setLocationNotice(`Spot "${newSpot.name}" berhasil disimpan di peta.`);
    setTimeout(() => setLocationNotice(null), 4000);
    return true;
  };

  // Handle Like
  const handleLike = async (spotId: string) => {
    try {
      await fetch(`/api/locations/${spotId}/like`, { method: 'POST' });
    } catch {
      // ignore
    }

    setSpots((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, likes_count: s.likes_count + 1 } : s))
    );
    if (activePopupSpot && activePopupSpot.id === spotId) {
      setActivePopupSpot((prev) => (prev ? { ...prev, likes_count: prev.likes_count + 1 } : null));
    }
    if (modalDetailSpot && modalDetailSpot.id === spotId) {
      setModalDetailSpot((prev) => (prev ? { ...prev, likes_count: prev.likes_count + 1 } : null));
    }
  };

  // Handle Report
  const handleSubmitReport = async (report: {
    spot_id: string;
    spot_name: string;
    category: string;
    notes?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      return res.ok;
    } catch {
      return true;
    }
  };

  // Start map picking mode
  const handleStartPickOnMap = () => {
    setIsUploadOpen(false);
    setIsPickingLocation(true);
    setMobileView('map');
    setLocationNotice('Klik lokasi pada peta untuk memilih titik koordinat.');
  };

  // User clicked on map to pick location
  const handlePickLocation = (coords: { lat: number; lng: number }) => {
    setPickedCoords(coords);
    setIsPickingLocation(false);
    setIsUploadOpen(true);
    setTargetFocusLocation({
      lat: coords.lat,
      lng: coords.lng,
      zoom: 15
    });
    setLocationNotice(`Titik lokasi dipilih (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}).`);
    setTimeout(() => setLocationNotice(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-900 text-neutral-100 overflow-hidden select-none">
      {/* Google Maps Quota Warning Banner */}
      {quotaExceeded && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 text-xs text-center sticky top-0 z-50">
          <span>
            Batas kuota Google Maps Platform tercapai. Kunjungi{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              situs pengembang Google Maps
            </a>{' '}
            untuk memperbarui akun Anda.
          </span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="h-16 shrink-0 bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-white shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-none">
              GowesMap
            </h1>
            <p className="text-2xs sm:text-xs text-neutral-400 mt-1">
              Peta Komunitas Pesepeda Indonesia
            </p>
          </div>
        </div>

        {/* Desktop Search Bar with Kabupaten Redirection */}
        <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-md mx-6 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Cari spot gowes atau nama kabupaten..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete / Kabupaten Suggestions Dropdown */}
          {showSearchDropdown &&
            (regencySuggestions.length > 0 || spotSuggestions.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden z-50 text-xs">
                {regencySuggestions.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 bg-neutral-900 text-3xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-emerald-400" />
                      <span>Wilayah / Kabupaten di Indonesia</span>
                    </div>
                    {regencySuggestions.map((reg) => (
                      <button
                        key={reg.name}
                        type="button"
                        onClick={() => handleSelectRegency(reg)}
                        className="w-full px-3 py-2 text-left hover:bg-neutral-850 flex items-center justify-between transition cursor-pointer border-b border-neutral-900 last:border-0"
                      >
                        <div>
                          <div className="font-medium text-neutral-200">
                            {reg.name}
                          </div>
                          <div className="text-3xs text-neutral-400">
                            {reg.province}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-3xs text-emerald-400">
                          <span>Arahkan Peta</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {spotSuggestions.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 bg-neutral-900 text-3xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>Spot Gowes Terdaftar</span>
                    </div>
                    {spotSuggestions.map((spot) => (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => handleSelectSpotSuggestion(spot)}
                        className="w-full px-3 py-2 text-left hover:bg-neutral-850 flex items-center justify-between transition cursor-pointer border-b border-neutral-900 last:border-0"
                      >
                        <div className="truncate mr-2">
                          <div className="font-medium text-neutral-200 truncate">
                            {spot.name}
                          </div>
                          <div className="text-3xs text-neutral-400 truncate italic font-serif">
                            "{spot.quote}"
                          </div>
                        </div>
                        <span className="text-3xs text-neutral-400 shrink-0">
                          Buka Spot
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Lokasi Saya Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocatingUser}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border border-neutral-800 transition cursor-pointer"
            title="Temukan posisi saya saat ini"
          >
            <Navigation
              className={`w-3.5 h-3.5 text-emerald-400 ${
                isLocatingUser ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">Lokasi Saya</span>
          </button>

          {/* Toggle Sidebar on Desktop */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border border-neutral-800 transition cursor-pointer"
            title="Buka atau tutup panel daftar"
          >
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span>{isSidebarOpen ? 'Sembunyikan Panel' : 'Lihat Daftar'}</span>
          </button>

          {/* Mobile View Toggle */}
          <button
            onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-neutral-200 border border-neutral-800 cursor-pointer"
          >
            {mobileView === 'map' ? (
              <>
                <List className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daftar</span>
              </>
            ) : (
              <>
                <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Peta</span>
              </>
            )}
          </button>

          {/* Tambah Spot Button */}
          <button
            onClick={() => {
              setIsUploadOpen(true);
              setIsPickingLocation(false);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Spot</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {locationNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-neutral-950 border border-neutral-700 text-xs text-neutral-200 rounded-lg shadow-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{locationNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Map View */}
        <div
          className={`flex-1 h-full relative ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          <Map
            spots={filteredSpots}
            activePopupSpot={activePopupSpot}
            onSetPopupSpot={(spot) => setActivePopupSpot(spot)}
            onOpenDetail={(spot) => setModalDetailSpot(spot)}
            userLocation={userLocation}
            targetFocusLocation={targetFocusLocation}
            isPickingLocation={isPickingLocation}
            pickedLocation={pickedCoords}
            onPickLocation={handlePickLocation}
          />

          {/* Floating Mobile Search (when in map view) */}
          <div className="md:hidden absolute top-3 left-3 right-3 z-10">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari spot gowes atau kabupaten..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-950/95 backdrop-blur-sm border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 shadow-lg focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Sidebar / List View */}
        <div
          className={`w-full md:w-80 lg:w-96 h-full bg-neutral-950 border-l border-neutral-800 flex flex-col shrink-0 transition-all duration-200 z-10 ${
            mobileView === 'list'
              ? 'block'
              : isSidebarOpen
              ? 'hidden md:flex'
              : 'hidden'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-neutral-200">
                Spot Gowes ({filteredSpots.length})
              </h3>
            </div>
            <span className="text-3xs text-neutral-500">Peta Indonesia</span>
          </div>

          {/* Spots List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredSpots.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <Compass className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400 font-medium">
                  Tidak ada spot yang cocok dengan kata kunci tersebut.
                </p>
                <p className="text-3xs text-neutral-500">
                  Ketik nama kabupaten seperti "Cilacap", "Bantul", atau "Kulon Progo" untuk menjelajah.
                </p>
              </div>
            ) : (
              filteredSpots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  isSelected={activePopupSpot?.id === spot.id}
                  onClick={() => {
                    setActivePopupSpot(spot);
                    setTargetFocusLocation({
                      lat: Number(spot.latitude),
                      lng: Number(spot.longitude),
                      zoom: 15
                    });
                    if (mobileView === 'list') {
                      setMobileView('map');
                    }
                  }}
                />
              ))
            )}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-3xs text-neutral-400 text-center">
            Pencarian otomatis mengarahkan kamera peta ke kabupaten atau kota tujuan.
          </div>
        </div>
      </div>

      {/* Modals */}
      <SpotDetailModal
        spot={modalDetailSpot}
        onClose={() => setModalDetailSpot(null)}
        onLike={handleLike}
        onOpenReport={(spot) => setReportTargetSpot(spot)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setIsPickingLocation(false);
        }}
        onSubmit={handleCreateSpot}
        onStartPickOnMap={handleStartPickOnMap}
        pickedCoords={pickedCoords}
        userLocation={userLocation}
      />

      <ReportModal
        spot={reportTargetSpot}
        onClose={() => setReportTargetSpot(null)}
        onSubmitReport={handleSubmitReport}
      />
    </div>
  );
}
