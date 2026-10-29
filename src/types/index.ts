export interface LocationSpot {
  id: string;
  name: string;
  description?: string;
  quote: string;
  latitude: number;
  longitude: number;
  photo_url: string; // Cover photo used for map pin
  photos: string[]; // Up to 3 photos
  photographer_name?: string;
  captured_at?: string;
  created_at: string;
  likes_count: number;
  status: 'published' | 'pending' | 'rejected';
}

export interface ReportItem {
  id: string;
  spot_id: string;
  spot_name: string;
  category: 'konten_tidak_pantas' | 'lokasi_privat' | 'spam' | 'bukan_gowes' | 'lainnya';
  notes?: string;
  created_at: string;
}

export interface CreateSpotDto {
  name: string;
  description?: string;
  quote: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  photos: string[];
  photographer_name?: string;
  captured_at?: string;
}
