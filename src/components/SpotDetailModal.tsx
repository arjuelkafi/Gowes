import { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  User,
  Heart,
  Share2,
  AlertTriangle,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
  Images
} from 'lucide-react';
import { LocationSpot } from '../types';
import { formatWIB } from '../utils/formatters';

interface SpotDetailModalProps {
  spot: LocationSpot | null;
  onClose: () => void;
  onLike: (spotId: string) => void;
  onOpenReport: (spot: LocationSpot) => void;
}

export default function SpotDetailModal({
  spot,
  onClose,
  onLike,
  onOpenReport
}: SpotDetailModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  if (!spot) return null;

  const photoList = spot.photos && spot.photos.length > 0 ? spot.photos : [spot.photo_url];
  const currentPhoto = photoList[activePhotoIndex] || spot.photo_url;

  const handleShare = () => {
    const text = `${spot.name} - Peta Komunitas Pesepeda: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      onLike(spot.id);
    }
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-neutral-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-neutral-800 text-emerald-400 border border-neutral-700">
              Spot Gowes
            </span>
            {photoList.length > 1 && (
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 flex items-center gap-1">
                <Images className="w-3 h-3 text-emerald-400" />
                <span>{photoList.length} Foto</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Main Photo Viewer */}
          <div className="relative w-full h-72 sm:h-96 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
            <img
              src={currentPhoto}
              alt={`${spot.name} - Foto ${activePhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Carousel navigation buttons */}
            {photoList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-neutral-950/80 hover:bg-neutral-950 text-white border border-neutral-700 transition cursor-pointer shadow-lg"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-neutral-950/80 hover:bg-neutral-950 text-white border border-neutral-700 transition cursor-pointer shadow-lg"
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-neutral-950/90 text-white border border-neutral-700 text-2xs font-mono">
                  {activePhotoIndex + 1} / {photoList.length}
                </div>
              </>
            )}
          </div>

          {/* Photo Thumbnails Selector (when more than 1 photo) */}
          {photoList.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {photoList.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title & Quote */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {spot.name}
            </h2>

            <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
              <p className="text-neutral-200 text-sm italic font-serif leading-relaxed">
                "{spot.quote}"
              </p>
            </div>

            {spot.description && (
              <p className="text-sm text-neutral-300 leading-relaxed">
                {spot.description}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start gap-3">
              <User className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-neutral-400">Pengunggah</div>
                <div className="text-sm font-medium text-neutral-200">
                  {spot.photographer_name || 'Pesepeda Anonim'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start gap-3">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-neutral-400">Waktu Kunjungan (WIB)</div>
                <div className="text-sm font-medium text-neutral-200">
                  {formatWIB(spot.captured_at || spot.created_at)}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start gap-3 sm:col-span-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-neutral-400">Koordinat GPS</div>
                <div className="text-sm font-mono text-neutral-200">
                  {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
                </div>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-400 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 rounded transition"
              >
                <span>Buka Rute</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                hasLiked
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span>{spot.likes_count} Disukai</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => onOpenReport(spot)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Laporkan Spot</span>
          </button>
        </div>
      </div>
    </div>
  );
}
