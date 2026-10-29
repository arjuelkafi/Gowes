import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LocationSpot {
  id: string;
  name: string;
  description?: string;
  quote: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  photos: string[];
  photographer_name?: string;
  captured_at?: string;
  created_at: string;
  likes_count: number;
  status: 'published' | 'pending' | 'rejected';
}

interface ReportItem {
  id: string;
  spot_id: string;
  spot_name: string;
  category: string;
  notes?: string;
  created_at: string;
}

const dataDir = path.resolve(__dirname, 'data');
const locationsFile = path.join(dataDir, 'locations.json');
const reportsFile = path.join(dataDir, 'reports.json');

function ensureDataStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readLocations(): LocationSpot[] {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(locationsFile, 'utf-8');
    const items = JSON.parse(raw);
    return items.map((it: Partial<LocationSpot>) => ({
      ...it,
      photos: Array.isArray(it.photos) && it.photos.length > 0 ? it.photos : (it.photo_url ? [it.photo_url] : [])
    }));
  } catch {
    return [];
  }
}

function writeLocations(locations: LocationSpot[]): void {
  ensureDataStore();
  fs.writeFileSync(locationsFile, JSON.stringify(locations, null, 2), 'utf-8');
}

function readReports(): ReportItem[] {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(reportsFile, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeReports(reports: ReportItem[]): void {
  ensureDataStore();
  fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '25mb' }));

  // API Endpoints
  app.get('/api/locations', (req: Request, res: Response) => {
    try {
      const { search } = req.query;
      let spots = readLocations().filter(s => s.status === 'published');

      if (search && typeof search === 'string') {
        const query = search.toLowerCase().trim();
        spots = spots.filter(s =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query)) ||
          s.quote.toLowerCase().includes(query)
        );
      }

      res.json({ success: true, count: spots.length, data: spots });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data lokasi';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.get('/api/locations/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const spot = readLocations().find(s => s.id === id);
      if (!spot) {
        return res.status(404).json({ success: false, error: 'Lokasi tidak ditemukan' });
      }
      res.json({ success: true, data: spot });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.post('/api/locations', (req: Request, res: Response) => {
    try {
      const {
        name,
        quote,
        description,
        latitude,
        longitude,
        photo_url,
        photos,
        photographer_name,
        captured_at
      } = req.body;

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Nama lokasi wajib diisi.' });
      }
      if (!quote || typeof quote !== 'string' || quote.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Catatan cerita singkat wajib diisi.' });
      }

      // Collect photos (1 to 3)
      let photoList: string[] = [];
      if (Array.isArray(photos) && photos.length > 0) {
        photoList = photos.slice(0, 3).filter((p) => typeof p === 'string' && p.length > 0);
      } else if (typeof photo_url === 'string' && photo_url.length > 0) {
        photoList = [photo_url];
      }

      if (photoList.length === 0) {
        return res.status(400).json({ success: false, error: 'Minimal 1 foto wajib diunggah (maksimal 3 foto).' });
      }

      const numLat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude));
      const numLng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude));

      if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        return res.status(400).json({ success: false, error: 'Koordinat lintang tidak valid.' });
      }
      if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        return res.status(400).json({ success: false, error: 'Koordinat bujur tidak valid.' });
      }

      const newSpot: LocationSpot = {
        id: 'spot-' + crypto.randomUUID(),
        name: name.trim().slice(0, 100),
        description: description ? String(description).trim().slice(0, 300) : undefined,
        quote: quote.trim().slice(0, 250),
        latitude: parseFloat(numLat.toFixed(6)),
        longitude: parseFloat(numLng.toFixed(6)),
        photo_url: photoList[0],
        photos: photoList,
        photographer_name: photographer_name ? String(photographer_name).trim().slice(0, 50) : 'Pesepeda Anonim',
        captured_at: captured_at ? String(captured_at) : new Date().toISOString(),
        created_at: new Date().toISOString(),
        likes_count: 0,
        status: 'published'
      };

      const spots = readLocations();
      spots.unshift(newSpot);
      writeLocations(spots);

      res.status(201).json({ success: true, message: 'Lokasi berhasil disimpan.', data: newSpot });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan lokasi';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.post('/api/locations/:id/like', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const spots = readLocations();
      const index = spots.findIndex(s => s.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Lokasi tidak ditemukan' });
      }
      spots[index].likes_count += 1;
      writeLocations(spots);
      res.json({ success: true, likes_count: spots[index].likes_count });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui suka';
      res.status(500).json({ success: false, error: message });
    }
  });

  app.post('/api/reports', (req: Request, res: Response) => {
    try {
      const { spot_id, spot_name, category, notes } = req.body;
      if (!spot_id) {
        return res.status(400).json({ success: false, error: 'ID lokasi diperlukan' });
      }

      const report: ReportItem = {
        id: 'rep-' + crypto.randomUUID(),
        spot_id: String(spot_id),
        spot_name: String(spot_name || 'Tidak diketahui'),
        category: String(category || 'lainnya'),
        notes: notes ? String(notes).slice(0, 500) : '',
        created_at: new Date().toISOString()
      };

      const reports = readReports();
      reports.push(report);
      writeReports(reports);

      res.status(201).json({ success: true, message: 'Laporan berhasil dikirim dan akan ditinjau.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim laporan';
      res.status(500).json({ success: false, error: message });
    }
  });

  // Mount Vite or static server
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GowesMap server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
