import { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Compass,
  MapPin,
  Plus
} from 'lucide-react';
import { CreateSpotDto } from '../types';
import { compressImage } from '../utils/formatters';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSpotDto) => Promise<boolean>;
  onStartPickOnMap: () => void;
  pickedCoords?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
}

export default function UploadModal({
  isOpen,
  onClose,
  onSubmit,
  onStartPickOnMap,
  pickedCoords,
  userLocation
}: UploadModalProps) {
  const [name, setName] = useState('');
  const [quote, setQuote] = useState('');
  const [description, setDescription] = useState('');
  const [photographerName, setPhotographerName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // GPS & Location source
  const [locationSource, setLocationSource] = useState<'gps' | 'map' | 'manual'>('gps');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync picked coordinates from map
  useEffect(() => {
    if (pickedCoords) {
      setLatitude(parseFloat(pickedCoords.lat.toFixed(6)));
      setLongitude(parseFloat(pickedCoords.lng.toFixed(6)));
      setLocationSource('map');
      setGpsStatus('success');
      setGpsErrorMsg('');
    }
  }, [pickedCoords]);

  // Initial GPS or user location
  useEffect(() => {
    if (isOpen && !latitude && !longitude) {
      if (pickedCoords) {
        setLatitude(parseFloat(pickedCoords.lat.toFixed(6)));
        setLongitude(parseFloat(pickedCoords.lng.toFixed(6)));
        setLocationSource('map');
        setGpsStatus('success');
      } else if (userLocation) {
        setLatitude(parseFloat(userLocation.lat.toFixed(6)));
        setLongitude(parseFloat(userLocation.lng.toFixed(6)));
        setLocationSource('gps');
        setGpsStatus('success');
      } else {
        requestGpsLocation();
      }
    }
  }, [isOpen, pickedCoords, userLocation]);

  if (!isOpen) return null;

  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsErrorMsg('Peramban web tidak mendukung akses geolokasi.');
      return;
    }

    setGpsStatus('locating');
    setGpsErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
        setLocationSource('gps');
        setGpsStatus('success');
      },
      (error) => {
        setGpsStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsErrorMsg('Izin akses lokasi perangkat ditolak.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsErrorMsg('Informasi lokasi perangkat tidak tersedia.');
            break;
          case error.TIMEOUT:
            setGpsErrorMsg('Waktu pencarian sinyal GPS habis.');
            break;
          default:
            setGpsErrorMsg('Gagal mendeteksi lokasi perangkat.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleUseMyCurrentLocation = () => {
    if (userLocation) {
      setLatitude(parseFloat(userLocation.lat.toFixed(6)));
      setLongitude(parseFloat(userLocation.lng.toFixed(6)));
      setLocationSource('gps');
      setGpsStatus('success');
      setGpsErrorMsg('');
    } else {
      requestGpsLocation();
    }
  };

  const handlePhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - photos.length;
    if (remainingSlots <= 0) {
      setSubmitError('Maksimal foto yang dapat diunggah adalah 3 foto.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsCompressing(true);
    setSubmitError('');

    try {
      const processed: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImage(file, 1400, 0.82);
        processed.push(compressed);
      }

      if (processed.length === 0) {
        setSubmitError('Hanya file foto berformat JPG, PNG, atau WebP yang diterima.');
      } else {
        setPhotos((prev) => [...prev, ...processed].slice(0, 3));
      }
    } catch {
      setSubmitError('Gagal memproses file foto.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!name.trim()) {
      setSubmitError('Nama lokasi wajib diisi.');
      return;
    }

    if (!quote.trim()) {
      setSubmitError('Cerita singkat atau catatan wajib diisi.');
      return;
    }

    if (photos.length === 0) {
      setSubmitError('Minimal 1 foto wajib diunggah (maksimal 3 foto).');
      return;
    }

    if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
      setSubmitError('Koordinat lokasi wajib ditentukan melalui GPS atau klik peta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSpotDto = {
        name: name.trim(),
        quote: quote.trim(),
        description: description.trim() || undefined,
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6)),
        photo_url: photos[0],
        photos,
        photographer_name: photographerName.trim() || undefined,
        captured_at: new Date().toISOString()
      };

      const success = await onSubmit(payload);
      if (success) {
        setName('');
        setQuote('');
        setDescription('');
        setPhotos([]);
        setLatitude(null);
        setLongitude(null);
        setGpsStatus('idle');
        onClose();
      } else {
        setSubmitError('Gagal menyimpan spot ke database server.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi gangguan saat mengunggah.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base text-white">Unggah Spot Gowes Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg flex items-center gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Location / GPS Coordinates Section */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Lokasi Titik Spot
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onStartPickOnMap}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 transition cursor-pointer"
                  title="Klik lokasi langsung pada peta"
                >
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pilih di Peta</span>
                </button>
                <button
                  type="button"
                  onClick={handleUseMyCurrentLocation}
                  disabled={gpsStatus === 'locating'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer"
                  title="Gunakan posisi GPS saat ini"
                >
                  {gpsStatus === 'locating' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Lokasi Saya</span>
                </button>
              </div>
            </div>

            {gpsStatus === 'locating' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mencari koordinat GPS perangkat Anda...</span>
              </div>
            )}

            {gpsStatus === 'error' && (
              <div className="text-xs text-amber-300 bg-amber-950/50 border border-amber-800 p-2.5 rounded">
                <p>{gpsErrorMsg}</p>
                <p className="mt-1 text-neutral-400">
                  Gunakan tombol "Pilih di Peta" untuk menentukan lokasi langsung dengan mengklik peta.
                </p>
              </div>
            )}

            {latitude !== null && longitude !== null && (
              <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono font-medium">
                      Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
                    </span>
                  </div>
                  <span
                    className={`text-3xs px-2 py-0.5 rounded font-medium ${
                      locationSource === 'map'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {locationSource === 'map' ? 'Titik dari Klik Peta' : 'Titik dari GPS Anda'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Photo Upload Section (Up to 3 Photos) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-300">
                Foto Spot <span className="text-rose-400">*</span>{' '}
                <span className="text-neutral-400 font-normal">
                  (1 hingga 3 foto)
                </span>
              </label>
              <span className="text-xs text-emerald-400 font-mono">
                {photos.length}/3 Foto
              </span>
            </div>

            {/* Photos Preview Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 group"
                >
                  <img
                    src={url}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-3xs font-medium bg-neutral-950/90 text-white border border-neutral-700">
                    {idx === 0 ? 'Sampul Pin' : `Foto ${idx + 1}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-neutral-950/90 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
                    title="Hapus foto ini"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add more button if fewer than 3 photos */}
              {photos.length < 3 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-lg border-2 border-dashed border-neutral-700 hover:border-emerald-500 bg-neutral-950 flex flex-col items-center justify-center gap-1.5 p-2 cursor-pointer transition text-center ${
                    photos.length === 0 ? 'col-span-3 h-36' : ''
                  }`}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                      <span className="text-2xs text-neutral-400">Memproses...</span>
                    </>
                  ) : (
                    <>
                      {photos.length === 0 ? (
                        <>
                          <Upload className="w-6 h-6 text-neutral-400" />
                          <span className="text-xs text-neutral-300 font-medium">
                            Pilih Foto (1 hingga 3 foto)
                          </span>
                          <span className="text-3xs text-neutral-500">
                            Foto pertama akan dijadikan pin utama pada peta.
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 text-emerald-400" />
                          <span className="text-2xs text-neutral-300 font-medium">
                            Tambah Foto
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotosSelect}
            />
          </div>

          {/* Spot Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Nama Spot Gowes <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Jalan Hijau Majenang"
              maxLength={100}
              className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Quote / Short Story */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Catatan atau Cerita Singkat <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Tuliskan kesan atau kalimat singkat mengenai tempat ini."
              rows={2}
              maxLength={250}
              className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
              required
            />
            <div className="text-right text-2xs text-neutral-400">
              {quote.length}/250 karakter
            </div>
          </div>

          {/* Extra Description (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Deskripsi Tambahan <span className="text-neutral-500">(Opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kondisi aspal, warung terdekat, atau rekomendasi waktu gowes."
              rows={2}
              maxLength={300}
              className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Photographer Name (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Nama Pengunggah <span className="text-neutral-500">(Opsional)</span>
            </label>
            <input
              type="text"
              value={photographerName}
              onChange={(e) => setPhotographerName(e.target.value)}
              placeholder="Kosongkan jika ingin anonim"
              maxLength={50}
              className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notice */}
          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-2xs text-neutral-400 leading-normal">
            Spot ini akan ditampilkan secara publik sebagai pin foto pada peta tanpa registrasi akun.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || photos.length === 0 || !name || !quote || latitude === null}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Spot...</span>
                </>
              ) : (
                <span>Publikasikan ke Peta</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
