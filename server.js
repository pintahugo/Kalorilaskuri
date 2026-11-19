import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'fitness.db');
const db = new DatabaseSync(DB_PATH);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    weight REAL NOT NULL,
    calories INTEGER NOT NULL,
    protein REAL,
    carbs REAL,
    fat REAL,
    workout INTEGER DEFAULT 0,
    workout_notes TEXT DEFAULT '',
    workout_mood INTEGER,
    recovery INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default settings if not exists
const getSettingStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
const setSettingStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');

if (!getSettingStmt.get('calorie_target')) {
  setSettingStmt.run('calorie_target', '2400');
}
if (!getSettingStmt.get('goal_mode')) {
  setSettingStmt.run('goal_mode', 'maintenance');
}

const PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Virheellinen JSON-muoto'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, 'public', safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Ei löydy');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

// Helper to generate realistic 30-day random test data
function generateRealistic30Days() {
  const workoutTemplates = [
    { notes: 'Jalkatreeni: kyykky 4x8, prässi, ojennus, koukistus', mood: 4 },
    { notes: 'Yläkroppa: penkkipunnerrus 4x6, kulmasoutu, pystypunnerrus', mood: 5 },
    { notes: 'Keskivartalo & HIIT: lankut, voimapyörä, 20 min intervalli', mood: 4 },
    { notes: 'Selkä & hauis: leuanveto 4x8, alatalja, hauiskääntö tangolla', mood: 5 },
    { notes: 'Rinta & olkapäät: vinopenkki käsipainoilla, viparit sivulle, dipit', mood: 4 },
    { notes: 'Kevyt palauttava kävely & venyttely', mood: 3 }
  ];

  db.exec('DELETE FROM entries');

  const insertStmt = db.prepare(`
    INSERT INTO entries (date, weight, calories, protein, carbs, fat, workout, workout_notes, workout_mood, recovery)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  let currentWeight = 79.2; // Realistic starting weight
  const calorieTarget = 2400;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Realistic weight progression with minor water weight noise
    // Calorie intake fluctuates around target with weekend spikes
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let calDeviation = (Math.random() * 300 - 150);
    if (isWeekend) calDeviation += (Math.random() * 250 + 50); // slight weekend surplus
    const calories = Math.round(calorieTarget + calDeviation);

    // Subtle downward/stabilizing trend: daily caloric delta impacts weight slightly
    const dailyBalance = calories - 2450;
    const fatDelta = dailyBalance / 7700;
    const waterNoise = (Math.random() * 0.4 - 0.2);
    currentWeight = Math.round((currentWeight + fatDelta * 0.4 + waterNoise * 0.1) * 10) / 10;
    // Keep reasonable bounds
    currentWeight = Math.max(76.5, Math.min(82.0, currentWeight));

    // Calculate realistic macros
    // Recommended protein: 2.0g/kg
    const targetProtein = Math.round(currentWeight * 2.0);
    const actualProtein = Math.round(targetProtein + (Math.random() * 20 - 10));

    // Recommended fat: 0.8g/kg
    const targetFat = Math.round(currentWeight * 0.8);
    const actualFat = Math.round(targetFat + (Math.random() * 16 - 8));

    // Carbs calculated from remainder
    const remainingCals = calories - (actualProtein * 4) - (actualFat * 9);
    const actualCarbs = Math.max(50, Math.round(remainingCals / 4));

    // Workout ~ 4-5 days a week
    const isWorkout = (dayOfWeek !== 3 && dayOfWeek !== 0) || (Math.random() > 0.6);
    let workoutNotes = '';
    let workoutMood = null;
    if (isWorkout) {
      const template = workoutTemplates[Math.floor(Math.random() * (workoutTemplates.length - 1))];
      workoutNotes = template.notes;
      workoutMood = Math.max(1, Math.min(5, Math.round(template.mood + (Math.random() * 1.4 - 0.7))));
    }

    // Sleep / recovery 1-5 (mostly 3-5, sometimes 2)
    const recovery = Math.random() > 0.15 ? Math.floor(Math.random() * 3) + 3 : 2;

    insertStmt.run(
      dateStr,
      currentWeight,
      calories,
      actualProtein,
      actualCarbs,
      actualFat,
      isWorkout ? 1 : 0,
      workoutNotes,
      workoutMood,
      recovery
    );
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // --- API ENDPOINTS ---

    // GET /api/entries
    if (method === 'GET' && pathname === '/api/entries') {
      const rows = db.prepare('SELECT * FROM entries ORDER BY date ASC').all();
      return sendJson(res, 200, { success: true, entries: rows });
    }

    // POST /api/entries
    if (method === 'POST' && pathname === '/api/entries') {
      const body = await parseJsonBody(req);
      const {
        date,
        weight,
        calories,
        protein,
        carbs,
        fat,
        workout,
        workout_notes,
        workout_mood,
        recovery
      } = body;

      if (!date || !weight || !calories) {
        return sendJson(res, 400, {
          success: false,
          error: 'Päivämäärä, aamupaino ja kalorit ovat pakollisia kenttiä.'
        });
      }

      const stmt = db.prepare(`
        INSERT INTO entries (date, weight, calories, protein, carbs, fat, workout, workout_notes, workout_mood, recovery)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          weight = excluded.weight,
          calories = excluded.calories,
          protein = excluded.protein,
          carbs = excluded.carbs,
          fat = excluded.fat,
          workout = excluded.workout,
          workout_notes = excluded.workout_notes,
          workout_mood = excluded.workout_mood,
          recovery = excluded.recovery
      `);

      stmt.run(
        date,
        parseFloat(weight),
        parseInt(calories, 10),
        protein !== undefined && protein !== '' ? parseFloat(protein) : null,
        carbs !== undefined && carbs !== '' ? parseFloat(carbs) : null,
        fat !== undefined && fat !== '' ? parseFloat(fat) : null,
        workout ? 1 : 0,
        workout_notes || '',
        workout_mood ? parseInt(workout_mood, 10) : null,
        recovery ? parseInt(recovery, 10) : null
      );

      const saved = db.prepare('SELECT * FROM entries WHERE date = ?').get(date);
      return sendJson(res, 201, { success: true, entry: saved });
    }

    // PUT /api/entries/:id
    if (method === 'PUT' && pathname.startsWith('/api/entries/')) {
      const id = parseInt(pathname.split('/')[3], 10);
      const body = await parseJsonBody(req);
      const {
        date,
        weight,
        calories,
        protein,
        carbs,
        fat,
        workout,
        workout_notes,
        workout_mood,
        recovery
      } = body;

      const stmt = db.prepare(`
        UPDATE entries SET
          date = ?,
          weight = ?,
          calories = ?,
          protein = ?,
          carbs = ?,
          fat = ?,
          workout = ?,
          workout_notes = ?,
          workout_mood = ?,
          recovery = ?
        WHERE id = ?
      `);

      stmt.run(
        date,
        parseFloat(weight),
        parseInt(calories, 10),
        protein !== undefined && protein !== '' ? parseFloat(protein) : null,
        carbs !== undefined && carbs !== '' ? parseFloat(carbs) : null,
        fat !== undefined && fat !== '' ? parseFloat(fat) : null,
        workout ? 1 : 0,
        workout_notes || '',
        workout_mood ? parseInt(workout_mood, 10) : null,
        recovery ? parseInt(recovery, 10) : null,
        id
      );

      const updated = db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
      return sendJson(res, 200, { success: true, entry: updated });
    }

    // DELETE /api/entries/:id
    if (method === 'DELETE' && pathname.startsWith('/api/entries/')) {
      const id = parseInt(pathname.split('/')[3], 10);
      db.prepare('DELETE FROM entries WHERE id = ?').run(id);
      return sendJson(res, 200, { success: true, message: 'Merkintä poistettu' });
    }

    // POST /api/generate-random
    if (method === 'POST' && pathname === '/api/generate-random') {
      generateRealistic30Days();
      const rows = db.prepare('SELECT * FROM entries ORDER BY date ASC').all();
      return sendJson(res, 200, {
        success: true,
        message: '30 päivää realistista testidataa luotu onnistuneesti.',
        entries: rows
      });
    }

    // POST /api/reset
    if (method === 'POST' && pathname === '/api/reset') {
      db.exec('DELETE FROM entries');
      return sendJson(res, 200, { success: true, message: 'Tietokanta tyhjennetty.' });
    }

    // GET /api/settings
    if (method === 'GET' && pathname === '/api/settings') {
      const calRow = getSettingStmt.get('calorie_target');
      const goalRow = getSettingStmt.get('goal_mode');
      return sendJson(res, 200, {
        success: true,
        settings: {
          calorie_target: parseInt(calRow ? calRow.value : '2400', 10),
          goal_mode: goalRow ? goalRow.value : 'maintenance'
        }
      });
    }

    // POST /api/settings
    if (method === 'POST' && pathname === '/api/settings') {
      const body = await parseJsonBody(req);
      if (body.calorie_target !== undefined) {
        setSettingStmt.run('calorie_target', String(body.calorie_target));
      }
      if (body.goal_mode !== undefined) {
        setSettingStmt.run('goal_mode', String(body.goal_mode));
      }
      return sendJson(res, 200, { success: true, message: 'Asetukset tallennettu' });
    }

    // GET /api/export
    if (method === 'GET' && pathname === '/api/export') {
      const format = reqUrl.searchParams.get('format') || 'json';
      const rows = db.prepare('SELECT * FROM entries ORDER BY date ASC').all();

      if (format === 'csv') {
        const headers = [
          'Päivämäärä',
          'Aamupaino_kg',
          'Kalorit_kcal',
          'Proteiini_g',
          'Hiilihydraatit_g',
          'Rasva_g',
          'Salitreeni',
          'Treenin_kuvaus',
          'Treenin_fiilis_1_5',
          'Palautuminen_1_5'
        ];
        const lines = [headers.join(';')];
        for (const r of rows) {
          lines.push([
            r.date,
            r.weight,
            r.calories,
            r.protein !== null ? r.protein : '',
            r.carbs !== null ? r.carbs : '',
            r.fat !== null ? r.fat : '',
            r.workout ? 'Kyllä' : 'Ei',
            `"${(r.workout_notes || '').replace(/"/g, '""')}"`,
            r.workout_mood !== null ? r.workout_mood : '',
            r.recovery !== null ? r.recovery : ''
          ].join(';'));
        }
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="kalorivahti_vienti.csv"'
        });
        return res.end('\uFEFF' + lines.join('\n'));
      }

      // JSON export
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="kalorivahti_vienti.json"'
      });
      return res.end(JSON.stringify(rows, null, 2));
    }

    // Static file fallback
    serveStatic(req, res, pathname);
  } catch (err) {
    console.error('Server error:', err);
    sendJson(res, 500, { success: false, error: err.message || 'Palvelinvirhe' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Kalori- ja makrovahti käynnissä osoitteessa: http://localhost:${PORT}`);
});
