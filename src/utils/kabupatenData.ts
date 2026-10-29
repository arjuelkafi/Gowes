export interface RegencyLocation {
  name: string;
  type: 'Kabupaten' | 'Kota' | 'Kecamatan';
  province: string;
  lat: number;
  lng: number;
  zoom: number;
  aliases?: string[];
}

export const INDONESIA_REGENCIES: RegencyLocation[] = [
  // Jawa Tengah & DIY
  {
    name: 'Kabupaten Cilacap',
    type: 'Kabupaten',
    province: 'Jawa Tengah',
    lat: -7.45,
    lng: 108.95,
    zoom: 11,
    aliases: ['majenang', 'cilacap', 'sidareja', 'kroya', 'dayeuhluhur']
  },
  {
    name: 'Kabupaten Bantul',
    type: 'Kabupaten',
    province: 'DI Yogyakarta',
    lat: -7.89,
    lng: 110.36,
    zoom: 11,
    aliases: ['bantul', 'selarong', 'imogiri', 'mangunan', 'dlingo', 'kasihan', 'sewon']
  },
  {
    name: 'Kabupaten Kulon Progo',
    type: 'Kabupaten',
    province: 'DI Yogyakarta',
    lat: -7.77,
    lng: 110.16,
    zoom: 11,
    aliases: ['kulon progo', 'kulonprogo', 'sermo', 'nglinggo', 'menoreh', 'wates', 'samigaluh', 'girimulyo']
  },
  {
    name: 'Kabupaten Klaten',
    type: 'Kabupaten',
    province: 'Jawa Tengah',
    lat: -7.70,
    lng: 110.60,
    zoom: 11,
    aliases: ['klaten', 'plaosan', 'prambanan', 'delanggu', 'jatinom', 'pedan']
  },
  {
    name: 'Kabupaten Sleman',
    type: 'Kabupaten',
    province: 'DI Yogyakarta',
    lat: -7.68,
    lng: 110.40,
    zoom: 11,
    aliases: ['sleman', 'kaliurang', 'breksi', 'cangkringan', 'pakem', 'ngaglik', 'depok sleman']
  },
  {
    name: 'Kota Yogyakarta',
    type: 'Kota',
    province: 'DI Yogyakarta',
    lat: -7.797,
    lng: 110.370,
    zoom: 12,
    aliases: ['jogja', 'yogyakarta', 'malioboro', 'tugu jogja', 'kraton']
  },
  {
    name: 'Kabupaten Gunungkidul',
    type: 'Kabupaten',
    province: 'DI Yogyakarta',
    lat: -7.98,
    lng: 110.60,
    zoom: 11,
    aliases: ['gunungkidul', 'wonosari', 'patuk', 'parangtritis', 'panggang']
  },
  {
    name: 'Kabupaten Banyumas',
    type: 'Kabupaten',
    province: 'Jawa Tengah',
    lat: -7.42,
    lng: 109.24,
    zoom: 11,
    aliases: ['banyumas', 'purwokerto', 'baturraden', 'ajibarang']
  },
  {
    name: 'Kabupaten Magelang',
    type: 'Kabupaten',
    province: 'Jawa Tengah',
    lat: -7.50,
    lng: 110.22,
    zoom: 11,
    aliases: ['magelang', 'borobudur', 'muntilan', 'ketep', 'merbabu']
  },
  {
    name: 'Kota Semarang',
    type: 'Kota',
    province: 'Jawa Tengah',
    lat: -7.00,
    lng: 110.42,
    zoom: 12,
    aliases: ['semarang', 'simpang lima', 'gombel']
  },
  {
    name: 'Kota Surakarta',
    type: 'Kota',
    province: 'Jawa Tengah',
    lat: -7.57,
    lng: 110.82,
    zoom: 12,
    aliases: ['solo', 'surakarta', 'manahan', 'laweyan']
  },
  {
    name: 'Kabupaten Karanganyar',
    type: 'Kabupaten',
    province: 'Jawa Tengah',
    lat: -7.60,
    lng: 111.05,
    zoom: 11,
    aliases: ['karanganyar', 'tawangmangu', 'candi cetho', 'candi sukuh']
  },
  {
    name: 'Kabupaten Boyolali',
    type: 'Kabupaten',
    province: 'Jawa Tengah',
    lat: -7.53,
    lng: 110.60,
    zoom: 11,
    aliases: ['boyolali', 'selo boyolali']
  },
  {
    name: 'Kabupaten Wonosobo',
    type: 'Kabupaten',
    province: 'Jawa Tengah',
    lat: -7.36,
    lng: 109.90,
    zoom: 11,
    aliases: ['wonosobo', 'dieng', 'sikunir']
  },

  // DKI Jakarta & Banten & Jabar
  {
    name: 'Kota Jakarta Selatan',
    type: 'Kota',
    province: 'DKI Jakarta',
    lat: -6.26,
    lng: 106.81,
    zoom: 12,
    aliases: ['jakarta selatan', 'sudirman', 'senayan', 'blok m', 'kemang', 'kebayoran']
  },
  {
    name: 'Kota Jakarta Pusat',
    type: 'Kota',
    province: 'DKI Jakarta',
    lat: -6.18,
    lng: 106.83,
    zoom: 12,
    aliases: ['jakarta pusat', 'monas', 'thamrin', 'menteng', 'tanah abang']
  },
  {
    name: 'Kota Jakarta Utara',
    type: 'Kota',
    province: 'DKI Jakarta',
    lat: -6.13,
    lng: 106.88,
    zoom: 12,
    aliases: ['jakarta utara', 'pik', 'pantai indah kapuk', 'ancol', 'kelapa gading']
  },
  {
    name: 'Kota Bogor',
    type: 'Kota',
    province: 'Jawa Barat',
    lat: -6.59,
    lng: 106.79,
    zoom: 12,
    aliases: ['bogor', 'kebun raya']
  },
  {
    name: 'Kabupaten Bogor',
    type: 'Kabupaten',
    province: 'Jawa Barat',
    lat: -6.55,
    lng: 106.86,
    zoom: 11,
    aliases: ['sentul', 'puncak', 'cibinong', 'ciawi', 'megamendung']
  },
  {
    name: 'Kota Bandung',
    type: 'Kota',
    province: 'Jawa Barat',
    lat: -6.91,
    lng: 107.61,
    zoom: 12,
    aliases: ['bandung', 'dago', 'braga', 'gedung sate']
  },
  {
    name: 'Kabupaten Bandung Barat',
    type: 'Kabupaten',
    province: 'Jawa Barat',
    lat: -6.82,
    lng: 107.60,
    zoom: 11,
    aliases: ['lembang', 'tangkuban perahu', 'padalarang']
  },
  {
    name: 'Kabupaten Garut',
    type: 'Kabupaten',
    province: 'Jawa Barat',
    lat: -7.22,
    lng: 107.90,
    zoom: 11,
    aliases: ['garut', 'kamojang', 'darajat']
  },
  {
    name: 'Kabupaten Kuningan',
    type: 'Kabupaten',
    province: 'Jawa Barat',
    lat: -6.98,
    lng: 108.48,
    zoom: 11,
    aliases: ['kuningan', 'ciremai']
  },

  // Jawa Timur
  {
    name: 'Kota Surabaya',
    type: 'Kota',
    province: 'Jawa Timur',
    lat: -7.25,
    lng: 112.75,
    zoom: 12,
    aliases: ['surabaya', 'kenjeran', 'tunjungan']
  },
  {
    name: 'Kota Malang',
    type: 'Kota',
    province: 'Jawa Timur',
    lat: -7.98,
    lng: 112.63,
    zoom: 12,
    aliases: ['malang', 'ijen malang']
  },
  {
    name: 'Kota Batu',
    type: 'Kota',
    province: 'Jawa Timur',
    lat: -7.87,
    lng: 112.53,
    zoom: 12,
    aliases: ['batu', 'cangar', 'pujon']
  },
  {
    name: 'Kabupaten Banyuwangi',
    type: 'Kabupaten',
    province: 'Jawa Timur',
    lat: -8.22,
    lng: 114.36,
    zoom: 11,
    aliases: ['banyuwangi', 'ijen', 'ketapang']
  },
  {
    name: 'Kabupaten Pasuruan',
    type: 'Kabupaten',
    province: 'Jawa Timur',
    lat: -7.73,
    lng: 112.87,
    zoom: 11,
    aliases: ['pasuruan', 'tosari', 'bromo']
  },

  // Bali & Lombok
  {
    name: 'Kabupaten Badung',
    type: 'Kabupaten',
    province: 'Bali',
    lat: -8.58,
    lng: 115.17,
    zoom: 11,
    aliases: ['badung', 'kuta', 'canggu', 'seminyak', 'jimbaran', 'uluwatu']
  },
  {
    name: 'Kabupaten Gianyar',
    type: 'Kabupaten',
    province: 'Bali',
    lat: -8.53,
    lng: 115.32,
    zoom: 11,
    aliases: ['gianyar', 'ubud', 'tegallalang']
  },
  {
    name: 'Kabupaten Tabanan',
    type: 'Kabupaten',
    province: 'Bali',
    lat: -8.54,
    lng: 115.12,
    zoom: 11,
    aliases: ['tabanan', 'jatiluwih', 'bedugul', 'tanah lot']
  },
  {
    name: 'Kabupaten Lombok Barat',
    type: 'Kabupaten',
    province: 'Nusa Tenggara Barat',
    lat: -8.68,
    lng: 116.12,
    zoom: 11,
    aliases: ['lombok', 'lombok barat', 'senggigi', 'mataram']
  }
];

/**
 * Finds a matching Regency / Kabupaten based on search query.
 */
export function findRegency(query: string): RegencyLocation | null {
  if (!query || !query.trim()) return null;
  const clean = query.toLowerCase().trim();

  // 1. Direct name match
  const directMatch = INDONESIA_REGENCIES.find(
    (r) =>
      r.name.toLowerCase().includes(clean) ||
      clean.includes(r.name.toLowerCase()) ||
      r.name.toLowerCase().replace(/^(kabupaten|kota)\s+/i, '').includes(clean)
  );
  if (directMatch) return directMatch;

  // 2. Alias match (e.g. "majenang" -> "Kabupaten Cilacap")
  const aliasMatch = INDONESIA_REGENCIES.find((r) =>
    r.aliases?.some((alias) => clean.includes(alias) || alias.includes(clean))
  );
  if (aliasMatch) return aliasMatch;

  return null;
}
