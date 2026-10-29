import { MapPin, Heart, Clock, Images } from 'lucide-react';
import { LocationSpot } from '../types';
import { formatWIB } from '../utils/formatters';

interface SpotCardProps {
  spot: LocationSpot;
  isSelected: boolean;
  onClick: () => void;
}

export default function SpotCard({ spot, isSelected, onClick }: SpotCardProps) {
  const photoCount = spot.photos?.length || 1;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border transition cursor-pointer flex gap-3 text-left ${
        isSelected
          ? 'bg-neutral-800 border-emerald-500 shadow-md ring-1 ring-emerald-500'
          : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-850 hover:border-neutral-700'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-lg overflow-hidden bg-neutral-950 shrink-0 border border-neutral-800">
        <img
          src={spot.photo_url}
          alt={spot.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {photoCount > 1 && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-neutral-950/90 text-white text-3xs font-mono border border-neutral-700 flex items-center gap-0.5">
            <Images className="w-2.5 h-2.5 text-emerald-400" />
            <span>{photoCount}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="font-semibold text-sm text-neutral-100 truncate">
            {spot.name}
          </h4>
          <p className="text-xs text-neutral-400 italic line-clamp-1 mt-0.5 font-serif">
            "{spot.quote}"
          </p>
        </div>

        <div className="space-y-1 mt-2">
          <div className="flex items-center gap-1 text-3xs text-neutral-400">
            <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{formatWIB(spot.captured_at || spot.created_at)}</span>
          </div>

          <div className="flex items-center justify-between text-3xs text-neutral-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
              <span>{spot.photographer_name || 'Pesepeda Anonim'}</span>
            </div>
            <div className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3 h-3 fill-rose-500/20" />
              <span>{spot.likes_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
