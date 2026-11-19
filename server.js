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

// Initialize schema
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

  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT DEFAULT '',
    calories_100g REAL NOT NULL,
    protein_100g REAL NOT NULL,
    carbs_100g REAL NOT NULL,
    fat_100g REAL NOT NULL,
    serving_size_g REAL DEFAULT 100,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS meal_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    food_name TEXT NOT NULL,
    brand TEXT DEFAULT '',
    barcode TEXT DEFAULT '',
    portion_g REAL NOT NULL,
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workout_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    split_type TEXT,
    exercises_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    notes TEXT DEFAULT '',
    duration_min INTEGER DEFAULT 60,
    rating INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workout_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    set_order INTEGER NOT NULL,
    weight_kg REAL NOT NULL,
    reps INTEGER NOT NULL,
    rpe REAL,
    is_warmup INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
  );
`);

// Settings helpers
const getSettingStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
const setSettingStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');

if (!getSettingStmt.get('calorie_target')) {
  setSettingStmt.run('calorie_target', '2400');
}
if (!getSettingStmt.get('goal_mode')) {
  setSettingStmt.run('goal_mode', 'maintenance');
}

// Seed popular Finnish/Nordic food database if empty
const countFoods = db.prepare('SELECT COUNT(*) as count FROM foods').get();
if (countFoods.count === 0) {
  const insertFood = db.prepare(`
    INSERT INTO foods (barcode, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, serving_size_g)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialFoods = [
    { barcode: '6408430043121', name: 'Raejuusto perinteinen', brand: 'Valio', calories: 95, p: 16, c: 1.8, f: 2.5, serving: 150 },
    { barcode: '6411300000123', name: 'Pehmeä maitorahka', brand: 'Valio', calories: 60, p: 10, c: 4.2, f: 0.3, serving: 250 },
    { barcode: '6411200100456', name: 'Täysjyväkaurahiutale', brand: 'Elovena', calories: 365, p: 14, c: 55, f: 7.5, serving: 50 },
    { barcode: '6409100010012', name: 'Kanan rintafilee maustamaton', brand: 'Atria', calories: 105, p: 23, c: 0, f: 1.5, serving: 200 },
    { barcode: '6409100020021', name: 'Lohifilee tuore', brand: 'Kalaneuvos', calories: 205, p: 20, c: 0, f: 14, serving: 150 },
    { barcode: '6405200030034', name: 'Kananmuna vapaan kanan (L)', brand: 'Kultamuna', calories: 137, p: 12.5, c: 0.3, f: 9.7, serving: 60 },
    { barcode: '6413467012345', name: 'Reissumies Täysjyväruisleipä', brand: 'Oululainen', calories: 230, p: 9, c: 42, f: 1.5, serving: 55 },
    { barcode: '6410400040045', name: 'Basmatiriisi', brand: 'Risella', calories: 350, p: 8.5, c: 77, f: 1.0, serving: 75 },
    { barcode: '6430012345678', name: 'Hera80 Proteiinijauhe Suklaa', brand: 'Fast', calories: 390, p: 76, c: 6.5, f: 6.5, serving: 30 },
    { barcode: '2000000010001', name: 'Banaani tuore', brand: 'Chiquita', calories: 89, p: 1.1, c: 22.8, f: 0.3, serving: 120 },
    { barcode: '2000000020002', name: 'Omena punainen', brand: 'Kotimainen', calories: 52, p: 0.3, c: 13.8, f: 0.2, serving: 150 },
    { barcode: '2000000030003', name: 'Avokado tuore', brand: 'Ready to Eat', calories: 160, p: 2.0, c: 8.5, f: 14.7, serving: 100 },
    { barcode: '6415700050056', name: 'Maapähkinävoi 100% Crunchy', brand: 'Urtekram', calories: 610, p: 26, c: 12, f: 50, serving: 20 },
    { barcode: '6408430055112', name: 'Kevytmaito', brand: 'Valio', calories: 46, p: 3.3, c: 4.8, f: 1.5, serving: 200 },
    { barcode: '6416080066123', name: 'Pasta Penne Rigate', brand: 'Barilla', calories: 359, p: 12, c: 71.7, f: 2.0, serving: 80 }
  ];

  for (const f of initialFoods) {
    insertFood.run(f.barcode, f.name, f.brand, f.calories, f.p, f.c, f.f, f.serving);
  }
}

// Seed default Strong-style workout templates if empty
const countTemplates = db.prepare('SELECT COUNT(*) as count FROM workout_templates').get();
if (countTemplates.count === 0) {
  const insertTemplate = db.prepare(`
    INSERT INTO workout_templates (name, split_type, exercises_json)
    VALUES (?, ?, ?)
  `);

  const initialTemplates = [
    {
      name: 'Push / Työntävät',
      split: 'Push',
      exercises: [
        'Penkkipunnerrus tangolla',
        'Vinopenkki käsipainoilla',
        'Pystypunnerrus tangolla',
        'Viparit sivulle käsipainoilla',
        'Ranskalainen punnerrus',
        'Ojentajapunnerrus taljassa'
      ]
    },
    {
      name: 'Pull / Vetävät',
      split: 'Pull',
      exercises: [
        'Maastaveto',
        'Leuanveto lisäpainolla',
        'Kulmasoutu tangolla',
        'Ylätaljaveto',
        'Hauiskääntö tangolla',
        'Takaolkapääsoutu taljassa'
      ]
    },
    {
      name: 'Legs / Jalat & Vatsat',
      split: 'Legs',
      exercises: [
        'Takakyykky tangolla',
        'Jalkaprässi',
        'Romanialainen maastaveto',
        'Reiden koukistus laitteessa',
        'Pohjenousu seisten',
        'Voimapyörä vatsalihaksille'
      ]
    },
    {
      name: 'Full Body / Koko keho',
      split: 'Full Body',
      exercises: [
        'Takakyykky tangolla',
        'Penkkipunnerrus tangolla',
        'Leuanveto',
        'Pystypunnerrus',
        'Alataljasoutu'
      ]
    }
  ];

  for (const t of initialTemplates) {
    insertTemplate.run(t.name, t.split, JSON.stringify(t.exercises));
  }
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
      if (body.length > 5 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
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

// Recalculate and update the day's calorie and macro totals in `entries` from `meal_items`
function syncEntryTotalsFromMeals(date) {
  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(calories), 0) as total_calories,
      COALESCE(SUM(protein), 0) as total_protein,
      COALESCE(SUM(carbs), 0) as total_carbs,
      COALESCE(SUM(fat), 0) as total_fat
    FROM meal_items
    WHERE date = ?
  `).get(date);

  const existing = db.prepare('SELECT * FROM entries WHERE date = ?').get(date);
  if (existing) {
    db.prepare(`
      UPDATE entries SET
        calories = ?,
        protein = ?,
        carbs = ?,
        fat = ?
      WHERE date = ?
    `).run(
      Math.round(totals.total_calories),
      Math.round(totals.total_protein * 10) / 10,
      Math.round(totals.total_carbs * 10) / 10,
      Math.round(totals.total_fat * 10) / 10,
      date
    );
  }
}

// Generate 30 days of realistic, coherent data including meals and workouts
function generateRealistic30Days() {
  db.exec(`
    DELETE FROM meal_items;
    DELETE FROM workout_sets;
    DELETE FROM workout_sessions;
    DELETE FROM entries;
  `);

  const insertEntry = db.prepare(`
    INSERT INTO entries (date, weight, calories, protein, carbs, fat, workout, workout_notes, workout_mood, recovery)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMeal = db.prepare(`
    INSERT INTO meal_items (date, meal_type, food_name, brand, barcode, portion_g, calories, protein, carbs, fat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWorkout = db.prepare(`
    INSERT INTO workout_sessions (date, name, notes, duration_min, rating)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertSet = db.prepare(`
    INSERT INTO workout_sets (session_id, exercise_name, set_order, weight_kg, reps, rpe, is_warmup, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const allFoods = db.prepare('SELECT * FROM foods').all();
  const templates = db.prepare('SELECT * FROM workout_templates').all();

  const now = new Date();
  let currentWeight = 79.4;
  const calorieTarget = 2400;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let calDeviation = (Math.random() * 260 - 130);
    if (isWeekend) calDeviation += (Math.random() * 240 + 60);
    const targetDayCals = Math.round(calorieTarget + calDeviation);

    // Realistic weight progression
    const dailyBalance = targetDayCals - 2450;
    const fatDelta = dailyBalance / 7700;
    const waterNoise = (Math.random() * 0.4 - 0.2);
    currentWeight = Math.round((currentWeight + fatDelta * 0.4 + waterNoise * 0.1) * 10) / 10;
    currentWeight = Math.max(76.5, Math.min(82.0, currentWeight));

    // Realistic meals generation (Lifesum style)
    let dayP = 0, dayC = 0, dayF = 0, dayCals = 0;

    const mealsConfig = [
      { type: 'breakfast', foodName: 'Täysjyväkaurahiutale', portion: 60, brand: 'Elovena' },
      { type: 'breakfast', foodName: 'Raejuusto perinteinen', portion: 150, brand: 'Valio' },
      { type: 'breakfast', foodName: 'Banaani tuore', portion: 110, brand: 'Chiquita' },
      { type: 'lunch', foodName: 'Kanan rintafilee maustamaton', portion: 200, brand: 'Atria' },
      { type: 'lunch', foodName: 'Basmatiriisi', portion: 80, brand: 'Risella' },
      { type: 'lunch', foodName: 'Avokado tuore', portion: 75, brand: 'Ready to Eat' },
      { type: 'snack', foodName: 'Pehmeä maitorahka', portion: 250, brand: 'Valio' },
      { type: 'snack', foodName: 'Hera80 Proteiinijauhe Suklaa', portion: 30, brand: 'Fast' },
      { type: 'dinner', foodName: 'Lohifilee tuore', portion: 180, brand: 'Kalaneuvos' },
      { type: 'dinner', foodName: 'Reissumies Täysjyväruisleipä', portion: 70, brand: 'Oululainen' }
    ];

    for (const item of mealsConfig) {
      const food = allFoods.find(f => f.name.includes(item.foodName)) || allFoods[0];
      const scale = item.portion / 100;
      const cals = Math.round(food.calories_100g * scale);
      const p = Math.round(food.protein_100g * scale * 10) / 10;
      const c = Math.round(food.carbs_100g * scale * 10) / 10;
      const f = Math.round(food.fat_100g * scale * 10) / 10;

      dayCals += cals;
      dayP += p;
      dayC += c;
      dayF += f;

      insertMeal.run(dateStr, item.type, food.name, food.brand, food.barcode || '', item.portion, cals, p, c, f);
    }

    // Workout ~ 4-5 days a week (Strong style)
    const isWorkout = (dayOfWeek !== 3 && dayOfWeek !== 0) || (Math.random() > 0.65);
    let workoutNotes = '';
    let workoutMood = null;

    if (isWorkout) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      workoutNotes = `${template.name} (${template.split_type})`;
      workoutMood = Math.floor(Math.random() * 2) + 4; // 4 or 5

      const exercises = JSON.parse(template.exercises_json);
      const sessResult = insertWorkout.run(dateStr, template.name, `Hyvä tuntuma ja nousujohteinen volyymi.`, 60 + Math.floor(Math.random() * 20), workoutMood);
      const sessionId = sessResult.lastInsertRowid;

      // Add 3-4 exercises with 3 sets each
      for (const ex of exercises.slice(0, 4)) {
        let baseWeight = 80;
        if (ex.includes('Kyykky')) baseWeight = 110;
        if (ex.includes('Maastaveto')) baseWeight = 140;
        if (ex.includes('Pystypunnerrus')) baseWeight = 50;
        if (ex.includes('Hauis') || ex.includes('Viparit')) baseWeight = 15;

        // Warmup set
        insertSet.run(sessionId, ex, 1, Math.round(baseWeight * 0.6), 10, 6, 1, 1);
        // Working sets
        insertSet.run(sessionId, ex, 2, baseWeight, 8, 8, 0, 1);
        insertSet.run(sessionId, ex, 3, baseWeight, 8, 8.5, 0, 1);
        insertSet.run(sessionId, ex, 4, baseWeight, 7, 9, 0, 1);
      }
    }

    const recovery = Math.random() > 0.2 ? Math.floor(Math.random() * 2) + 4 : 3;

    insertEntry.run(
      dateStr,
      currentWeight,
      dayCals,
      Math.round(dayP),
      Math.round(dayC),
      Math.round(dayF),
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

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // --- API: ENTRIES ---
    if (method === 'GET' && pathname === '/api/entries') {
      const rows = db.prepare('SELECT * FROM entries ORDER BY date ASC').all();
      return sendJson(res, 200, { success: true, entries: rows });
    }

    if (method === 'POST' && pathname === '/api/entries') {
      const body = await parseJsonBody(req);
      const { date, weight, calories, protein, carbs, fat, workout, workout_notes, workout_mood, recovery } = body;

      if (!date || !weight || calories === undefined) {
        return sendJson(res, 400, { success: false, error: 'Päivämäärä, aamupaino ja kalorit ovat pakollisia kenttiä.' });
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

    if (method === 'PUT' && pathname.startsWith('/api/entries/')) {
      const id = parseInt(pathname.split('/')[3], 10);
      const body = await parseJsonBody(req);
      const { date, weight, calories, protein, carbs, fat, workout, workout_notes, workout_mood, recovery } = body;

      db.prepare(`
        UPDATE entries SET
          date = ?, weight = ?, calories = ?, protein = ?, carbs = ?, fat = ?,
          workout = ?, workout_notes = ?, workout_mood = ?, recovery = ?
        WHERE id = ?
      `).run(
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

    if (method === 'DELETE' && pathname.startsWith('/api/entries/')) {
      const id = parseInt(pathname.split('/')[3], 10);
      const row = db.prepare('SELECT date FROM entries WHERE id = ?').get(id);
      if (row) {
        db.prepare('DELETE FROM meal_items WHERE date = ?').run(row.date);
        db.prepare('DELETE FROM entries WHERE id = ?').run(id);
      }
      return sendJson(res, 200, { success: true, message: 'Merkintä poistettu' });
    }

    // --- API: MEAL ITEMS (Lifesum-style) ---
    if (method === 'GET' && pathname === '/api/meals') {
      const date = reqUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const items = db.prepare('SELECT * FROM meal_items WHERE date = ? ORDER BY id ASC').all(date);

      const summary = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        by_meal: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        }
      };

      for (const item of items) {
        summary.calories += item.calories;
        summary.protein += item.protein;
        summary.carbs += item.carbs;
        summary.fat += item.fat;
        if (summary.by_meal[item.meal_type]) {
          summary.by_meal[item.meal_type].push(item);
        }
      }

      summary.calories = Math.round(summary.calories);
      summary.protein = Math.round(summary.protein * 10) / 10;
      summary.carbs = Math.round(summary.carbs * 10) / 10;
      summary.fat = Math.round(summary.fat * 10) / 10;

      return sendJson(res, 200, { success: true, date, items, summary });
    }

    if (method === 'POST' && pathname === '/api/meals') {
      const body = await parseJsonBody(req);
      const { date, meal_type, food_name, brand, barcode, portion_g, calories, protein, carbs, fat } = body;

      if (!date || !meal_type || !food_name || portion_g === undefined) {
        return sendJson(res, 400, { success: false, error: 'Päivä, ateriatyyppi, tuotteen nimi ja annoskoko ovat pakollisia.' });
      }

      const stmt = db.prepare(`
        INSERT INTO meal_items (date, meal_type, food_name, brand, barcode, portion_g, calories, protein, carbs, fat)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        date,
        meal_type,
        food_name,
        brand || '',
        barcode || '',
        parseFloat(portion_g),
        parseFloat(calories || 0),
        parseFloat(protein || 0),
        parseFloat(carbs || 0),
        parseFloat(fat || 0)
      );

      // Auto-save product to local food memory if barcode provided or new food
      if (barcode || food_name) {
        const cal100 = (parseFloat(calories || 0) / parseFloat(portion_g)) * 100;
        const p100 = (parseFloat(protein || 0) / parseFloat(portion_g)) * 100;
        const c100 = (parseFloat(carbs || 0) / parseFloat(portion_g)) * 100;
        const f100 = (parseFloat(fat || 0) / parseFloat(portion_g)) * 100;

        try {
          db.prepare(`
            INSERT INTO foods (barcode, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, serving_size_g)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(barcode) DO UPDATE SET
              name = excluded.name,
              brand = excluded.brand,
              calories_100g = excluded.calories_100g,
              protein_100g = excluded.protein_100g,
              carbs_100g = excluded.carbs_100g,
              fat_100g = excluded.fat_100g
          `).run(barcode || null, food_name, brand || '', cal100, p100, c100, f100, parseFloat(portion_g));
        } catch (_) {}
      }

      // Sync entry totals
      syncEntryTotalsFromMeals(date);

      const saved = db.prepare('SELECT * FROM meal_items WHERE id = ?').get(result.lastInsertRowid);
      return sendJson(res, 201, { success: true, item: saved });
    }

    if (method === 'DELETE' && pathname.startsWith('/api/meals/')) {
      const id = parseInt(pathname.split('/')[3], 10);
      const row = db.prepare('SELECT date FROM meal_items WHERE id = ?').get(id);
      if (row) {
        db.prepare('DELETE FROM meal_items WHERE id = ?').run(id);
        syncEntryTotalsFromMeals(row.date);
      }
      return sendJson(res, 200, { success: true, message: 'Ateriakirjaus poistettu' });
    }

    // --- API: FOODS (Local Product Memory) ---
    if (method === 'GET' && pathname === '/api/foods') {
      const q = reqUrl.searchParams.get('q');
      const barcode = reqUrl.searchParams.get('barcode');

      if (barcode) {
        const item = db.prepare('SELECT * FROM foods WHERE barcode = ?').get(barcode);
        return sendJson(res, 200, { success: true, food: item || null });
      }

      if (q) {
        const items = db.prepare('SELECT * FROM foods WHERE name LIKE ? OR brand LIKE ? OR barcode LIKE ? ORDER BY name ASC LIMIT 30').all(`%${q}%`, `%${q}%`, `%${q}%`);
        return sendJson(res, 200, { success: true, foods: items });
      }

      const items = db.prepare('SELECT * FROM foods ORDER BY name ASC LIMIT 50').all();
      return sendJson(res, 200, { success: true, foods: items });
    }

    if (method === 'POST' && pathname === '/api/foods') {
      const body = await parseJsonBody(req);
      const { barcode, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, serving_size_g } = body;

      if (!name || calories_100g === undefined) {
        return sendJson(res, 400, { success: false, error: 'Tuotteen nimi ja kalorit per 100g ovat pakollisia.' });
      }

      const stmt = db.prepare(`
        INSERT INTO foods (barcode, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, serving_size_g)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(barcode) DO UPDATE SET
          name = excluded.name,
          brand = excluded.brand,
          calories_100g = excluded.calories_100g,
          protein_100g = excluded.protein_100g,
          carbs_100g = excluded.carbs_100g,
          fat_100g = excluded.fat_100g,
          serving_size_g = excluded.serving_size_g
      `);

      stmt.run(
        barcode || null,
        name,
        brand || '',
        parseFloat(calories_100g),
        parseFloat(protein_100g || 0),
        parseFloat(carbs_100g || 0),
        parseFloat(fat_100g || 0),
        parseFloat(serving_size_g || 100)
      );

      const saved = barcode
        ? db.prepare('SELECT * FROM foods WHERE barcode = ?').get(barcode)
        : db.prepare('SELECT * FROM foods WHERE name = ? ORDER BY id DESC LIMIT 1').get(name);

      return sendJson(res, 201, { success: true, food: saved });
    }

    // --- API: WORKOUTS & TEMPLATES (Strong-style) ---
    if (method === 'GET' && pathname === '/api/workout-templates') {
      const templates = db.prepare('SELECT * FROM workout_templates ORDER BY id ASC').all();
      return sendJson(res, 200, { success: true, templates });
    }

    if (method === 'GET' && pathname === '/api/workouts') {
      const date = reqUrl.searchParams.get('date');
      let sessionsQuery = 'SELECT * FROM workout_sessions ORDER BY date DESC, id DESC';
      let sessions = date
        ? db.prepare('SELECT * FROM workout_sessions WHERE date = ? ORDER BY id DESC').all(date)
        : db.prepare(sessionsQuery).all();

      const getSets = db.prepare('SELECT * FROM workout_sets WHERE session_id = ? ORDER BY id ASC');
      const fullSessions = sessions.map(s => ({
        ...s,
        sets: getSets.all(s.id)
      }));

      return sendJson(res, 200, { success: true, sessions: fullSessions });
    }

    if (method === 'POST' && pathname === '/api/workouts') {
      const body = await parseJsonBody(req);
      const { id, date, name, notes, duration_min, rating, sets } = body;

      if (!date || !name) {
        return sendJson(res, 400, { success: false, error: 'Päivämäärä ja treenin nimi ovat pakollisia.' });
      }

      let sessionId = id;
      if (sessionId) {
        db.prepare('UPDATE workout_sessions SET date = ?, name = ?, notes = ?, duration_min = ?, rating = ? WHERE id = ?')
          .run(date, name, notes || '', parseInt(duration_min || 60, 10), rating || null, sessionId);
        db.prepare('DELETE FROM workout_sets WHERE session_id = ?').run(sessionId);
      } else {
        const resInsert = db.prepare('INSERT INTO workout_sessions (date, name, notes, duration_min, rating) VALUES (?, ?, ?, ?, ?)')
          .run(date, name, notes || '', parseInt(duration_min || 60, 10), rating || null);
        sessionId = resInsert.lastInsertRowid;
      }

      if (Array.isArray(sets)) {
        const insertSet = db.prepare(`
          INSERT INTO workout_sets (session_id, exercise_name, set_order, weight_kg, reps, rpe, is_warmup, completed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        sets.forEach((s, idx) => {
          insertSet.run(
            sessionId,
            s.exercise_name,
            idx + 1,
            parseFloat(s.weight_kg || 0),
            parseInt(s.reps || 0, 10),
            s.rpe ? parseFloat(s.rpe) : null,
            s.is_warmup ? 1 : 0,
            s.completed !== undefined ? (s.completed ? 1 : 0) : 1
          );
        });
      }

      // Also ensure entries row reflects workout = 1
      const existingEntry = db.prepare('SELECT * FROM entries WHERE date = ?').get(date);
      if (existingEntry) {
        db.prepare('UPDATE entries SET workout = 1, workout_notes = ? WHERE date = ?').run(name, date);
      }

      const fullSession = db.prepare('SELECT * FROM workout_sessions WHERE id = ?').get(sessionId);
      fullSession.sets = db.prepare('SELECT * FROM workout_sets WHERE session_id = ? ORDER BY id ASC').all(sessionId);

      return sendJson(res, 201, { success: true, session: fullSession });
    }

    if (method === 'DELETE' && pathname.startsWith('/api/workouts/')) {
      const id = parseInt(pathname.split('/')[3], 10);
      db.prepare('DELETE FROM workout_sets WHERE session_id = ?').run(id);
      db.prepare('DELETE FROM workout_sessions WHERE id = ?').run(id);
      return sendJson(res, 200, { success: true, message: 'Treeni poistettu' });
    }

    // Strong-style history comparison: previous sets for an exercise
    if (method === 'GET' && pathname.startsWith('/api/workouts/history/')) {
      const rawExercise = pathname.replace('/api/workouts/history/', '');
      const exerciseName = decodeURIComponent(rawExercise);

      // Find the most recent session containing this exercise
      const prevSession = db.prepare(`
        SELECT ws.id, ws.date
        FROM workout_sessions ws
        JOIN workout_sets s ON s.session_id = ws.id
        WHERE s.exercise_name = ?
        ORDER BY ws.date DESC, ws.id DESC
        LIMIT 1
      `).get(exerciseName);

      if (!prevSession) {
        return sendJson(res, 200, { success: true, history: null });
      }

      const prevSets = db.prepare(`
        SELECT * FROM workout_sets
        WHERE session_id = ? AND exercise_name = ?
        ORDER BY set_order ASC
      `).all(prevSession.id, exerciseName);

      return sendJson(res, 200, {
        success: true,
        history: {
          session_id: prevSession.id,
          date: prevSession.date,
          sets: prevSets
        }
      });
    }

    // --- API: SYSTEM & EXPORT/IMPORT ---
    if (method === 'POST' && pathname === '/api/generate-random') {
      generateRealistic30Days();
      const rows = db.prepare('SELECT * FROM entries ORDER BY date ASC').all();
      return sendJson(res, 200, {
        success: true,
        message: '30 päivää realistista testidataa luotu (ruuat, treenit ja aamupainot).',
        entries: rows
      });
    }

    if (method === 'POST' && pathname === '/api/reset') {
      db.exec(`
        DELETE FROM meal_items;
        DELETE FROM workout_sets;
        DELETE FROM workout_sessions;
        DELETE FROM entries;
      `);
      return sendJson(res, 200, { success: true, message: 'Tietokanta tyhjennetty.' });
    }

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

    if (method === 'POST' && pathname === '/api/settings') {
      const body = await parseJsonBody(req);
      if (body.calorie_target !== undefined) setSettingStmt.run('calorie_target', String(body.calorie_target));
      if (body.goal_mode !== undefined) setSettingStmt.run('goal_mode', String(body.goal_mode));
      return sendJson(res, 200, { success: true, message: 'Asetukset tallennettu' });
    }

    if (method === 'GET' && pathname === '/api/export') {
      const format = reqUrl.searchParams.get('format') || 'json';
      const rows = db.prepare('SELECT * FROM entries ORDER BY date ASC').all();
      const meals = db.prepare('SELECT * FROM meal_items ORDER BY date ASC, id ASC').all();
      const workouts = db.prepare('SELECT * FROM workout_sessions ORDER BY date ASC').all();
      const sets = db.prepare('SELECT * FROM workout_sets ORDER BY session_id ASC, set_order ASC').all();
      const foods = db.prepare('SELECT * FROM foods ORDER BY name ASC').all();

      if (format === 'csv') {
        const headers = ['Päivämäärä', 'Aamupaino_kg', 'Kalorit_kcal', 'Proteiini_g', 'Hiilihydraatit_g', 'Rasva_g', 'Salitreeni', 'Treenin_kuvaus', 'Fiilis_1_5', 'Palautuminen_1_5'];
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

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="kalorivahti_koko_data.json"'
      });
      return res.end(JSON.stringify({ entries: rows, meals, workouts, sets, foods }, null, 2));
    }

    // Import endpoint
    if (method === 'POST' && pathname === '/api/import') {
      const body = await parseJsonBody(req);
      if (Array.isArray(body.entries)) {
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
        for (const r of body.entries) {
          stmt.run(r.date, r.weight, r.calories, r.protein, r.carbs, r.fat, r.workout, r.workout_notes || '', r.workout_mood, r.recovery);
        }
      }
      return sendJson(res, 200, { success: true, message: 'Tiedot tuotu onnistuneesti' });
    }

    // Static file fallback
    serveStatic(req, res, pathname);
  } catch (err) {
    console.error('Palvelinvirhe:', err);
    sendJson(res, 500, { success: false, error: err.message || 'Palvelinvirhe' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Kalori- ja makrovahti käynnissä osoitteessa: http://localhost:${PORT}`);
});
