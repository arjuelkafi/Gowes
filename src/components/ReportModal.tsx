import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { LocationSpot } from '../types';

interface ReportModalProps {
  spot: LocationSpot | null;
  onClose: () => void;
  onSubmitReport: (report: {
    spot_id: string;
    spot_name: string;
    category: string;
    notes?: string;
  }) => Promise<boolean>;
}

export default function ReportModal({
  spot,
  onClose,
  onSubmitReport
}: ReportModalProps) {
  const [category, setCategory] = useState('konten_tidak_pantas');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!spot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const ok = await onSubmitReport({
        spot_id: spot.id,
        spot_name: spot.name,
        category,
        notes: notes.trim() || undefined
      });

      if (ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1800);
      } else {
        setErrorMsg('Gagal mengirimkan laporan. Silakan coba lagi.');
      }
    } catch {
      setErrorMsg('Terjadi kendala saat mengirimkan laporan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-neutral-100">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-white">Laporkan Konten</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-semibold text-white">Laporan Diterima</h4>
            <p className="text-xs text-neutral-300">
              Terima kasih telah membantu menjaga komunitas pesepeda tetap aman dan nyaman.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
              <span className="text-neutral-400">Melaporkan spot:</span>{' '}
              <span className="font-semibold text-neutral-200">{spot.name}</span>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-950/70 border border-rose-800 rounded text-xs text-rose-200">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Alasan Laporan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="konten_tidak_pantas">Konten tidak pantas atau vulgar</option>
                <option value="lokasi_privat">Area pribadi atau lokasi terlarang</option>
                <option value="bukan_gowes">Bukan rute atau kegiatan bersepeda</option>
                <option value="spam">Spam atau promosi tidak relevan</option>
                <option value="lainnya">Alasan lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Catatan Tambahan <span className="text-neutral-500">(Opsional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jelaskan secara ringkas permasalahan pada unggahan ini."
                rows={3}
                maxLength={300}
                className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Laporan</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
