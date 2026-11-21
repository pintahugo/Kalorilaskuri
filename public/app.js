/**
 * Kalori- ja Makrovahti - Client-Side Privacy-First PWA Engine
 * All personal data is stored 100% locally on the user's device (localStorage).
 * Works offline, on GitHub Pages, and on local servers with zero data leakage.
 */

// Local Storage Keys
const STORAGE_KEYS = {
  SETTINGS: 'makrovahti_settings',
  ENTRIES: 'makrovahti_entries',
  MEALS: 'makrovahti_meals',
  WORKOUTS: 'makrovahti_workouts',
  FOODS: 'makrovahti_foods',
  CUSTOM_TEMPLATES: 'makrovahti_custom_templates',
  CUSTOM_EXERCISES: 'makrovahti_custom_exercises'
};

// Curated Gym Exercise Library categorized by muscle group
const PRESET_EXERCISES = [
  // Rinta
  { name: 'Penkkipunnerrus tangolla', cat: 'Rinta' },
  { name: 'Vinopenkkipunnerrus käsipainoilla', cat: 'Rinta' },
  { name: 'Ristitaljapunnerrus', cat: 'Rinta' },
  { name: 'Pec deck -laite', cat: 'Rinta' },
  { name: 'Dippi (rinta/ojentaja)', cat: 'Rinta' },
  { name: 'Etunojapunnerrus', cat: 'Rinta' },
  // Selkä
  { name: 'Maastaveto', cat: 'Selkä' },
  { name: 'Leuanveto omalla painolla', cat: 'Selkä' },
  { name: 'Leuanveto lisäpainolla', cat: 'Selkä' },
  { name: 'Kulmasoutu tangolla', cat: 'Selkä' },
  { name: 'Alataljasoutu', cat: 'Selkä' },
  { name: 'Ylätalja eteen', cat: 'Selkä' },
  { name: 'T-kulmasoutu', cat: 'Selkä' },
  // Jalat
  { name: 'Takakyykky tangolla', cat: 'Jalat' },
  { name: 'Etukyykky tangolla', cat: 'Jalat' },
  { name: 'Jalkaprässi', cat: 'Jalat' },
  { name: 'Reiden ojennus laitteessa', cat: 'Jalat' },
  { name: 'Reiden koukistus laitteessa', cat: 'Jalat' },
  { name: 'Romanialainen maastaveto', cat: 'Jalat' },
  { name: 'Pohjenousu seisten', cat: 'Jalat' },
  { name: 'Askelkyykky käsipainoilla', cat: 'Jalat' },
  // Olkapäät
  { name: 'Pystypunnerrus tangolla', cat: 'Olkapäät' },
  { name: 'Pystypunnerrus käsipainoilla', cat: 'Olkapäät' },
  { name: 'Vipunostot sivuille käsipainoilla', cat: 'Olkapäät' },
  { name: 'Face pull taljassa', cat: 'Olkapäät' },
  { name: 'Pystysoutu taljassa tai tangolla', cat: 'Olkapäät' },
  // Kädet
  { name: 'Hauiskääntö tangolla', cat: 'Kädet' },
  { name: 'Hauiskääntö käsipainoilla', cat: 'Kädet' },
  { name: 'Hammer-hauiskääntö', cat: 'Kädet' },
  { name: 'Hauiskääntö taljassa', cat: 'Kädet' },
  { name: 'Ojentajapunnerrus taljassa', cat: 'Kädet' },
  { name: 'Ranskalainen punnerrus', cat: 'Kädet' },
  { name: 'Kapea penkkipunnerrus', cat: 'Kädet' },
  // Keskivartalo
  { name: 'Voimapyörä', cat: 'Keskivartalo' },
  { name: 'Lankku', cat: 'Keskivartalo' },
  { name: 'Jalkojen nosto roikkuen', cat: 'Keskivartalo' },
  { name: 'Vatsarutistus taljassa', cat: 'Keskivartalo' }
];

// Default generic food items for offline & quick demo use (no personal data)
const DEFAULT_FOOD_CATALOG = [
  { barcode: '6408430043121', name: 'Raejuusto perinteinen', brand: 'Valio', calories_100g: 95, protein_100g: 16, carbs_100g: 1.8, fat_100g: 2.5, serving_size_g: 150 },
  { barcode: '6411300000123', name: 'Pehmeä maitorahka', brand: 'Valio', calories_100g: 60, protein_100g: 10, carbs_100g: 4.2, fat_100g: 0.3, serving_size_g: 250 },
  { barcode: '6411200100456', name: 'Täysjyväkaurahiutale', brand: 'Elovena', calories_100g: 365, protein_100g: 14, carbs_100g: 55, fat_100g: 7.5, serving_size_g: 50 },
  { barcode: '6409100010012', name: 'Kanan rintafilee maustamaton', brand: 'Atria', calories_100g: 105, protein_100g: 23, carbs_100g: 0, fat_100g: 1.5, serving_size_g: 200 },
  { barcode: '6409100020021', name: 'Lohifilee tuore', brand: 'Kalaneuvos', calories_100g: 205, protein_100g: 20, carbs_100g: 0, fat_100g: 14, serving_size_g: 150 },
  { barcode: '6405200030034', name: 'Kananmuna vapaan kanan (L)', brand: 'Kultamuna', calories_100g: 137, protein_100g: 12.5, carbs_100g: 0.3, fat_100g: 9.7, serving_size_g: 60 },
  { barcode: '6413467012345', name: 'Reissumies Täysjyväruisleipä', brand: 'Oululainen', calories_100g: 230, protein_100g: 9, carbs_100g: 42, fat_100g: 1.5, serving_size_g: 55 },
  { barcode: '6410400040045', name: 'Basmatiriisi', brand: 'Risella', calories_100g: 350, protein_100g: 8.5, carbs_100g: 77, fat_100g: 1.0, serving_size_g: 75 },
  { barcode: '6430012345678', name: 'Hera80 Proteiinijauhe Suklaa', brand: 'Fast', calories_100g: 390, protein_100g: 76, carbs_100g: 6.5, fat_100g: 6.5, serving_size_g: 30 },
  { barcode: '2000000010001', name: 'Banaani tuore', brand: 'Chiquita', calories_100g: 89, protein_100g: 1.1, carbs_100g: 22.8, fat_100g: 0.3, serving_size_g: 120 }
];

// App State
const state = {
  entries: [],
  meals: [],
  workouts: [],
  foods: [],
  customTemplates: [],
  customExercises: [],
  exerciseFilterCat: 'all',
  settings: {
    calorie_target: 2400,
    protein_factor: 2.0,
    fat_factor: 0.8,
    goal_mode: 'maintenance'
  },
  activeDate: new Date().toISOString().split('T')[0],
  currentMealType: 'breakfast',
  selectedFood: null,
  activeWorkout: null,
  restTimer: {
    interval: null,
    remainingSec: 0,
    totalSec: 90
  },
  scannerStream: null,
  scannerInterval: null,
  cameraFacing: 'environment'
};

// DOM Elements Cache
const el = {
  navTabs: document.getElementById('main-nav-tabs'),
  tabContents: document.querySelectorAll('.tab-content'),
  welcomeBanner: document.getElementById('welcome-banner'),
  btnWelcomeAdd: document.getElementById('btn-welcome-add'),
  btnWelcomeDemo: document.getElementById('btn-welcome-demo'),

  btnOpenSettings: document.getElementById('btn-open-settings'),
  settingsModal: document.getElementById('settings-modal'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  settingCalTarget: document.getElementById('setting-cal-target'),
  settingProteinFactor: document.getElementById('setting-protein-factor'),
  settingFatFactor: document.getElementById('setting-fat-factor'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  btnExportJson: document.getElementById('btn-export-json'),
  btnExportCsv: document.getElementById('btn-export-csv'),
  settingsImportFile: document.getElementById('settings-import-file'),
  btnLoadDemoData: document.getElementById('btn-load-demo-data'),
  btnClearAllData: document.getElementById('btn-clear-all-data'),

  btnOpenModal: document.getElementById('btn-open-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  entryModal: document.getElementById('entry-modal'),
  entryForm: document.getElementById('entry-form'),
  modalTitle: document.getElementById('modal-title'),

  // KPIs
  kpiTodayDate: document.getElementById('kpi-today-date'),
  kpiTodayCals: document.getElementById('kpi-today-cals'),
  kpiTargetCals: document.getElementById('kpi-target-cals'),
  kpiTodayDelta: document.getElementById('kpi-today-delta'),
  kpiTodayProgress: document.getElementById('kpi-today-progress'),
  kpi7dCals: document.getElementById('kpi-7d-cals'),
  kpi7dCalDelta: document.getElementById('kpi-7d-cal-delta'),
  kpi7dCalProgress: document.getElementById('kpi-7d-cal-progress'),
  kpiCurrentWeight: document.getElementById('kpi-current-weight'),
  kpi7dWeight: document.getElementById('kpi-7d-weight'),
  kpiWeightTrendBadge: document.getElementById('kpi-weight-trend-badge'),
  kpiWeightChangeText: document.getElementById('kpi-weight-change-text'),
  kpiTdeeVal: document.getElementById('kpi-tdee-val'),
  tdeeStatusBadge: document.getElementById('tdee-status-badge'),
  kpiTdeeInfo: document.getElementById('kpi-tdee-info'),

  // Goal & Analytics
  goalSelector: document.getElementById('goal-selector'),
  recCalVal: document.getElementById('rec-cal-val'),
  btnApplyRec: document.getElementById('btn-apply-rec'),
  recReasoningText: document.getElementById('rec-reasoning-text'),
  statWeightWeeklyRate: document.getElementById('stat-weight-weekly-rate'),
  statEnergyBalance: document.getElementById('stat-energy-balance'),
  statCurrentTargetCals: document.getElementById('stat-current-target-cals'),

  // Macro Section
  globalCalorieTarget: document.getElementById('global-calorie-target'),
  btnSaveTarget: document.getElementById('btn-save-target'),
  macroFormulaDesc: document.getElementById('macro-formula-desc'),
  formulaPTag: document.getElementById('formula-p-tag'),
  formulaFTag: document.getElementById('formula-f-tag'),
  macroActProtein: document.getElementById('macro-act-protein'),
  macroActProteinCal: document.getElementById('macro-act-protein-cal'),
  macroTgtProtein: document.getElementById('macro-tgt-protein'),
  macroTgtProteinCal: document.getElementById('macro-tgt-protein-cal'),
  barProtein: document.getElementById('bar-protein'),
  pctProtein: document.getElementById('pct-protein'),
  diffProtein: document.getElementById('diff-protein'),
  macroActFat: document.getElementById('macro-act-fat'),
  macroActFatCal: document.getElementById('macro-act-fat-cal'),
  macroTgtFat: document.getElementById('macro-tgt-fat'),
  macroTgtFatCal: document.getElementById('macro-tgt-fat-cal'),
  barFat: document.getElementById('bar-fat'),
  pctFat: document.getElementById('pct-fat'),
  diffFat: document.getElementById('diff-fat'),
  macroActCarbs: document.getElementById('macro-act-carbs'),
  macroActCarbsCal: document.getElementById('macro-act-carbs-cal'),
  macroTgtCarbs: document.getElementById('macro-tgt-carbs'),
  macroTgtCarbsCal: document.getElementById('macro-tgt-carbs-cal'),
  barCarbs: document.getElementById('bar-carbs'),
  pctCarbs: document.getElementById('pct-carbs'),
  diffCarbs: document.getElementById('diff-carbs'),

  // Charts
  weightSvg: document.getElementById('weight-svg'),
  weightTooltip: document.getElementById('weight-tooltip'),
  caloriesSvg: document.getElementById('calories-svg'),
  caloriesTooltip: document.getElementById('calories-tooltip'),

  // History Table
  entriesTbody: document.getElementById('entries-tbody'),
  entryCountLabel: document.getElementById('entry-count-label'),

  // Day Form Modal Fields
  entryId: document.getElementById('entry-id'),
  formDate: document.getElementById('form-date'),
  formWeight: document.getElementById('form-weight'),
  formCalories: document.getElementById('form-calories'),
  formProtein: document.getElementById('form-protein'),
  formCarbs: document.getElementById('form-carbs'),
  formFat: document.getElementById('form-fat'),
  previewP: document.getElementById('preview-p'),
  previewF: document.getElementById('preview-f'),
  previewC: document.getElementById('preview-c'),
  btnAutofillMacros: document.getElementById('btn-autofill-macros'),
  macroSumKcal: document.getElementById('macro-sum-kcal'),
  formWorkout: document.getElementById('form-workout'),
  workoutDetailsWrap: document.getElementById('workout-details-wrap'),
  formWorkoutNotes: document.getElementById('form-workout-notes'),
  formWorkoutMood: document.getElementById('form-workout-mood'),
  workoutMoodStars: document.getElementById('workout-mood-stars'),
  formRecovery: document.getElementById('form-recovery'),
  recoveryStars: document.getElementById('recovery-stars'),

  // Meals Tab
  mealsActiveDate: document.getElementById('meals-active-date'),
  btnPrevDay: document.getElementById('btn-prev-day'),
  btnNextDay: document.getElementById('btn-next-day'),
  btnToday: document.getElementById('btn-today'),
  btnOpenScanner: document.getElementById('btn-open-scanner'),
  btnQuickAddFood: document.getElementById('btn-quick-add-food'),
  mealsRemainCals: document.getElementById('meals-remain-cals'),
  mealsEatenCals: document.getElementById('meals-eaten-cals'),
  mealsTargetCals: document.getElementById('meals-target-cals'),
  ringCalProgress: document.getElementById('ring-cal-progress'),
  mealsPSummary: document.getElementById('meals-p-summary'),
  mealsPBar: document.getElementById('meals-p-bar'),
  mealsCSummary: document.getElementById('meals-c-summary'),
  mealsCBar: document.getElementById('meals-c-bar'),
  mealsFSummary: document.getElementById('meals-f-summary'),
  mealsFBar: document.getElementById('meals-f-bar'),
  subBreakfast: document.getElementById('sub-breakfast'),
  subLunch: document.getElementById('sub-lunch'),
  subDinner: document.getElementById('sub-dinner'),
  subSnack: document.getElementById('sub-snack'),
  listBreakfast: document.getElementById('list-breakfast'),
  listLunch: document.getElementById('list-lunch'),
  listDinner: document.getElementById('list-dinner'),
  listSnack: document.getElementById('list-snack'),

  // Food Scanner Modal
  foodModal: document.getElementById('food-modal'),
  btnCloseFoodModal: document.getElementById('btn-close-food-modal'),
  tabBtnScanner: document.getElementById('tab-btn-scanner'),
  tabBtnSearch: document.getElementById('tab-btn-search'),
  tabBtnManual: document.getElementById('tab-btn-manual'),
  viewScanner: document.getElementById('view-scanner'),
  viewSearch: document.getElementById('view-search'),
  viewManualFood: document.getElementById('view-manual-food'),
  scannerVideo: document.getElementById('scanner-video'),
  btnToggleCamera: document.getElementById('btn-toggle-camera'),
  btnSwitchCamera: document.getElementById('btn-switch-camera'),
  manualBarcodeInput: document.getElementById('manual-barcode-input'),
  btnFetchBarcode: document.getElementById('btn-fetch-barcode'),
  scannerStatusMsg: document.getElementById('scanner-status-msg'),
  foodSearchInput: document.getElementById('food-search-input'),
  foodResultsList: document.getElementById('food-results-list'),
  createFoodForm: document.getElementById('create-food-form'),

  // Portion & Add to Meal
  selectedProductCard: document.getElementById('selected-product-card'),
  prodName: document.getElementById('prod-name'),
  prodBrand: document.getElementById('prod-brand'),
  prodCal100g: document.getElementById('prod-cal-100g'),
  prodP100g: document.getElementById('prod-p-100g'),
  prodC100g: document.getElementById('prod-c-100g'),
  prodF100g: document.getElementById('prod-f-100g'),
  mealPortionG: document.getElementById('meal-portion-g'),
  targetMealType: document.getElementById('target-meal-type'),
  portionCals: document.getElementById('portion-cals'),
  portionP: document.getElementById('portion-p'),
  portionC: document.getElementById('portion-c'),
  portionF: document.getElementById('portion-f'),
  btnAddFoodToMeal: document.getElementById('btn-add-food-to-meal'),

  // Strong Workout Tab
  stickyRestTimer: document.getElementById('sticky-rest-timer'),
  restTimerDisplay: document.getElementById('rest-timer-display'),
  btnTimerPlus30: document.getElementById('btn-timer-plus30'),
  btnTimerStop: document.getElementById('btn-timer-stop'),
  workoutTemplateSelect: document.getElementById('workout-template-select'),
  customTemplatesOptgroup: document.getElementById('custom-templates-optgroup'),
  btnStartWorkout: document.getElementById('btn-start-workout'),
  btnStartCustomWorkout: document.getElementById('btn-start-custom-workout'),
  activeWorkoutCard: document.getElementById('active-workout-card'),
  workoutSessionName: document.getElementById('workout-session-name'),
  workoutSessionDate: document.getElementById('workout-session-date'),
  exercisesContainer: document.getElementById('exercises-container'),
  btnAddExercise: document.getElementById('btn-add-exercise'),
  btnSaveAsTemplate: document.getElementById('btn-save-as-template'),
  btnCancelWorkout: document.getElementById('btn-cancel-workout'),
  btnFinishWorkout: document.getElementById('btn-finish-workout'),
  pastWorkoutsList: document.getElementById('past-workouts-list'),
  workoutCountLabel: document.getElementById('workout-count-label'),

  // Exercise Picker Modal
  exercisePickerModal: document.getElementById('exercise-picker-modal'),
  btnCloseExercisePicker: document.getElementById('btn-close-exercise-picker'),
  exerciseSearchInput: document.getElementById('exercise-search-input'),
  exerciseCatPills: document.getElementById('exercise-cat-pills'),
  exercisePickerList: document.getElementById('exercise-picker-list'),
  customExerciseInput: document.getElementById('custom-exercise-input'),
  btnCreateCustomExercise: document.getElementById('btn-create-custom-exercise')
};

/**
 * Register Service Worker for PWA
 */
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.log('ServiceWorker registration skipped or failed:', err);
    });
  });
}

/**
 * Macro calculation rules:
 * - Protein: protein_factor (default 2.0 g) * weight (kg) (4 kcal/g)
 * - Fat: fat_factor (default 0.8 g) * weight (kg) (9 kcal/g)
 * - Carbs: max(0, round((calorieTarget - proteinKcal - fatKcal) / 4))
 */
function calculateRecommendedMacros(weightKg, calorieTarget) {
  if (!weightKg || weightKg <= 0) {
    return { protein: 0, fat: 0, carbs: 0, proteinKcal: 0, fatKcal: 0, carbsKcal: 0 };
  }
  const pFactor = state.settings.protein_factor || 2.0;
  const fFactor = state.settings.fat_factor || 0.8;

  const protein = Math.round(weightKg * pFactor);
  const proteinKcal = protein * 4;
  const fat = Math.round(weightKg * fFactor);
  const fatKcal = fat * 9;
  const remainingKcal = (calorieTarget || 2400) - proteinKcal - fatKcal;
  const carbs = Math.max(0, Math.round(remainingKcal / 4));
  const carbsKcal = carbs * 4;

  return { protein, fat, carbs, proteinKcal, fatKcal, carbsKcal };
}

/**
 * Web Audio API synthesizer chime
 */
function playAudioChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.log('Audio chime not supported or allowed yet', e);
  }
}

/**
 * =========================================================================
 * CLIENT-SIDE DATA STORAGE ENGINE (localStorage)
 * =========================================================================
 */
function loadDataFromStorage() {
  try {
    // Settings
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (storedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(storedSettings) };
    }

    // Entries
    const storedEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    state.entries = storedEntries ? JSON.parse(storedEntries) : [];

    // Meals
    const storedMeals = localStorage.getItem(STORAGE_KEYS.MEALS);
    state.meals = storedMeals ? JSON.parse(storedMeals) : [];

    // Workouts
    const storedWorkouts = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    state.workouts = storedWorkouts ? JSON.parse(storedWorkouts) : [];

    // Foods (Product memory)
    const storedFoods = localStorage.getItem(STORAGE_KEYS.FOODS);
    if (storedFoods) {
      state.foods = JSON.parse(storedFoods);
    } else {
      state.foods = [...DEFAULT_FOOD_CATALOG];
      saveToStorage(STORAGE_KEYS.FOODS, state.foods);
    }

    // Custom workout templates
    const storedTemplates = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
    state.customTemplates = storedTemplates ? JSON.parse(storedTemplates) : [];

    // Custom exercises created by the user
    const storedCustomEx = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    state.customExercises = storedCustomEx ? JSON.parse(storedCustomEx) : [];
  } catch (err) {
    console.error('Storage load error:', err);
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage save error for key:', key, err);
  }
}

function saveAllStateToStorage() {
  saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
  saveToStorage(STORAGE_KEYS.ENTRIES, state.entries);
  saveToStorage(STORAGE_KEYS.MEALS, state.meals);
  saveToStorage(STORAGE_KEYS.WORKOUTS, state.workouts);
  saveToStorage(STORAGE_KEYS.FOODS, state.foods);
  saveToStorage(STORAGE_KEYS.CUSTOM_TEMPLATES, state.customTemplates);
  saveToStorage(STORAGE_KEYS.CUSTOM_EXERCISES, state.customExercises);
}

/**
 * Recalculate and update the day's total calories & macros from logged meals
 */
function syncDayTotalsFromMeals(dateStr) {
  const dayMeals = state.meals.filter(m => m.date === dateStr);
  const totalCals = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalP = dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalC = dayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalF = dayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  const entry = state.entries.find(e => e.date === dateStr);
  if (entry) {
    entry.calories = Math.round(totalCals);
    entry.protein = Math.round(totalP * 10) / 10;
    entry.carbs = Math.round(totalC * 10) / 10;
    entry.fat = Math.round(totalF * 10) / 10;
    saveToStorage(STORAGE_KEYS.ENTRIES, state.entries);
  }
}

/**
 * =========================================================================
 * DEMO DATA GENERATOR (100% Client-Side Synthetic Mock Data)
 * =========================================================================
 */
function generateDemoData() {
  const now = new Date();
  let currentWeight = 79.2;
  const targetCals = state.settings.calorie_target || 2400;

  state.entries = [];
  state.meals = [];
  state.workouts = [];

  const workoutTemplates = [
    { name: 'Push / Työntävät', exercises: ['Penkkipunnerrus tangolla', 'Pystypunnerrus tangolla', 'Ojentajapunnerrus taljassa'] },
    { name: 'Pull / Vetävät', exercises: ['Maastaveto', 'Leuanveto lisäpainolla', 'Hauiskääntö tangolla'] },
    { name: 'Legs / Jalat', exercises: ['Takakyykky tangolla', 'Jalkaprässi', 'Reiden koukistus laitteessa'] }
  ];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let calDev = Math.random() * 260 - 130;
    if (isWeekend) calDev += 180;
    const dayCalories = Math.round(targetCals + calDev);

    const deltaKg = (dayCalories - 2450) / 7700;
    currentWeight = Math.round((currentWeight + deltaKg * 0.4 + (Math.random() * 0.3 - 0.15)) * 10) / 10;
    currentWeight = Math.max(76.0, Math.min(82.0, currentWeight));

    // Generate 4 meals
    const dayP = Math.round(currentWeight * 2.0 + (Math.random() * 10 - 5));
    const dayF = Math.round(currentWeight * 0.8 + (Math.random() * 8 - 4));
    const dayC = Math.max(50, Math.round((dayCalories - dayP * 4 - dayF * 9) / 4));

    state.meals.push(
      { id: Date.now() + Math.random(), date: dateStr, meal_type: 'breakfast', food_name: 'Täysjyväkaurahiutale', brand: 'Elovena', barcode: '6411200100456', portion_g: 60, calories: 219, protein: 8.4, carbs: 33, fat: 4.5 },
      { id: Date.now() + Math.random(), date: dateStr, meal_type: 'lunch', food_name: 'Kanan rintafilee maustamaton', brand: 'Atria', barcode: '6409100010012', portion_g: 200, calories: 210, protein: 46, carbs: 0, fat: 3 },
      { id: Date.now() + Math.random(), date: dateStr, meal_type: 'dinner', food_name: 'Lohifilee tuore', brand: 'Kalaneuvos', barcode: '6409100020021', portion_g: 150, calories: 308, protein: 30, carbs: 0, fat: 21 },
      { id: Date.now() + Math.random(), date: dateStr, meal_type: 'snack', food_name: 'Pehmeä maitorahka', brand: 'Valio', barcode: '6411300000123', portion_g: 250, calories: 150, protein: 25, carbs: 10.5, fat: 0.8 }
    );

    // Workout ~ 4 times a week
    const isWorkout = (dayOfWeek !== 3 && dayOfWeek !== 0) || Math.random() > 0.65;
    let workoutNotes = '';
    let workoutMood = null;

    if (isWorkout) {
      const template = workoutTemplates[Math.floor(Math.random() * workoutTemplates.length)];
      workoutNotes = template.name;
      workoutMood = Math.floor(Math.random() * 2) + 4;

      const sets = [];
      template.exercises.forEach(ex => {
        let baseW = ex.includes('Kyykky') ? 100 : (ex.includes('Maastaveto') ? 130 : 70);
        sets.push(
          { exercise_name: ex, set_order: 1, weight_kg: baseW * 0.7, reps: 10, rpe: 6, completed: 1 },
          { exercise_name: ex, set_order: 2, weight_kg: baseW, reps: 8, rpe: 8, completed: 1 },
          { exercise_name: ex, set_order: 3, weight_kg: baseW, reps: 8, rpe: 8.5, completed: 1 }
        );
      });

      state.workouts.push({
        id: Date.now() + Math.random(),
        date: dateStr,
        name: template.name,
        notes: 'Hyvä nousujohteinen treeni.',
        duration_min: 65,
        rating: workoutMood,
        sets
      });
    }

    state.entries.push({
      id: Date.now() + Math.random(),
      date: dateStr,
      weight: currentWeight,
      calories: dayCalories,
      protein: dayP,
      carbs: dayC,
      fat: dayF,
      workout: isWorkout ? 1 : 0,
      workout_notes: workoutNotes,
      workout_mood: workoutMood,
      recovery: Math.random() > 0.15 ? Math.floor(Math.random() * 2) + 4 : 3
    });
  }

  saveAllStateToStorage();
}

/**
 * =========================================================================
 * INITIALIZATION & EVENTS
 * =========================================================================
 */
function init() {
  loadDataFromStorage();
  applySettingsToUI();
  bindNavigationTabs();
  bindSettingsModalEvents();
  bindDayFormEvents();
  bindLifesumMealsEvents();
  bindBarcodeScannerEvents();
  bindStrongWorkoutEvents();
  populateCustomTemplatesDropdown();

  el.mealsActiveDate.value = state.activeDate;
  el.workoutSessionDate.value = state.activeDate;

  refreshAllViews();
}

function applySettingsToUI() {
  const s = state.settings;
  el.globalCalorieTarget.value = s.calorie_target;
  el.kpiTargetCals.textContent = s.calorie_target;
  el.settingCalTarget.value = s.calorie_target;
  el.settingProteinFactor.value = s.protein_factor || 2.0;
  el.settingFatFactor.value = s.fat_factor || 0.8;

  el.formulaPTag.textContent = `${s.protein_factor || 2.0} g / kg • 4 kcal/g`;
  el.formulaFTag.textContent = `${s.fat_factor || 0.8} g / kg • 9 kcal/g`;
  el.macroFormulaDesc.textContent = `Proteiini = ${s.protein_factor || 2.0} g × paino | Rasva = ${s.fat_factor || 0.8} g × paino | Hiilarit = loput kalorit (4 kcal/g)`;

  document.querySelectorAll('.goal-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.goal === s.goal_mode);
  });
}

function refreshAllViews() {
  updateDashboard();
  renderMealsForActiveDate();
  renderPastWorkouts();

  // Show welcome banner if user has 0 entries
  if (state.entries.length === 0) {
    el.welcomeBanner.style.display = 'flex';
  } else {
    el.welcomeBanner.style.display = 'none';
  }
}

/**
 * Navigation Tabs
 */
function bindNavigationTabs() {
  el.navTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-tab');
    if (!btn) return;
    const tabId = btn.dataset.tab;

    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    el.tabContents.forEach(tc => tc.classList.remove('active'));

    btn.classList.add('active');
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');

    if (tabId === 'tab-meals') renderMealsForActiveDate();
    if (tabId === 'tab-workout') renderPastWorkouts();
    if (tabId === 'tab-dashboard') updateDashboard();
  });

  // Welcome banner buttons
  el.btnWelcomeAdd.addEventListener('click', () => openDayModal());
  el.btnWelcomeDemo.addEventListener('click', () => {
    generateDemoData();
    refreshAllViews();
  });
}

/**
 * Settings & Data Management Modal
 */
function bindSettingsModalEvents() {
  el.btnOpenSettings.addEventListener('click', () => {
    el.settingsModal.classList.add('open');
  });

  el.btnCloseSettings.addEventListener('click', () => {
    el.settingsModal.classList.remove('open');
  });

  el.settingsModal.addEventListener('click', (e) => {
    if (e.target === el.settingsModal) el.settingsModal.classList.remove('open');
  });

  // Save Settings
  el.btnSaveSettings.addEventListener('click', () => {
    state.settings.calorie_target = parseInt(el.settingCalTarget.value, 10) || 2400;
    state.settings.protein_factor = parseFloat(el.settingProteinFactor.value) || 2.0;
    state.settings.fat_factor = parseFloat(el.settingFatFactor.value) || 0.8;
    saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
    applySettingsToUI();
    refreshAllViews();
    el.settingsModal.classList.remove('open');
  });

  // Quick Calorie Target input in Macro Section
  el.btnSaveTarget.addEventListener('click', () => {
    const val = parseInt(el.globalCalorieTarget.value, 10);
    if (val && val >= 1000 && val <= 8000) {
      state.settings.calorie_target = val;
      el.settingCalTarget.value = val;
      saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
      applySettingsToUI();
      refreshAllViews();
    }
  });

  // Goal Mode selector
  el.goalSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.goal-btn');
    if (!btn) return;
    state.settings.goal_mode = btn.dataset.goal;
    saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateAnalytics();
  });

  // Apply recommendation button
  el.btnApplyRec.addEventListener('click', () => {
    const recCal = parseInt(el.recCalVal.textContent, 10);
    if (recCal && !isNaN(recCal)) {
      state.settings.calorie_target = recCal;
      saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
      applySettingsToUI();
      refreshAllViews();
    }
  });

  // Export JSON
  el.btnExportJson.addEventListener('click', () => {
    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      settings: state.settings,
      entries: state.entries,
      meals: state.meals,
      workouts: state.workouts,
      foods: state.foods
    };
    downloadFile(JSON.stringify(exportData, null, 2), 'kalorivahti_varmuuskopio.json', 'application/json');
  });

  // Export CSV
  el.btnExportCsv.addEventListener('click', () => {
    const headers = ['Päivämäärä', 'Aamupaino_kg', 'Kalorit_kcal', 'Proteiini_g', 'Hiilarit_g', 'Rasva_g', 'Treeni', 'Kuvaus', 'Fiilis', 'Uni'];
    const lines = [headers.join(';')];
    state.entries.forEach(r => {
      lines.push([
        r.date,
        r.weight,
        r.calories,
        r.protein !== null ? r.protein : '',
        r.carbs !== null ? r.carbs : '',
        r.fat !== null ? r.fat : '',
        r.workout ? 'Kyllä' : 'Ei',
        `"${(r.workout_notes || '').replace(/"/g, '""')}"`,
        r.workout_mood || '',
        r.recovery || ''
      ].join(';'));
    });
    downloadFile('\uFEFF' + lines.join('\n'), 'kalorivahti_historia.csv', 'text/csv;charset=utf-8;');
  });

  // Import JSON
  el.settingsImportFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (imported.settings) state.settings = { ...state.settings, ...imported.settings };
      if (Array.isArray(imported.entries)) state.entries = imported.entries;
      if (Array.isArray(imported.meals)) state.meals = imported.meals;
      if (Array.isArray(imported.workouts)) state.workouts = imported.workouts;
      if (Array.isArray(imported.foods)) state.foods = imported.foods;
      saveAllStateToStorage();
      applySettingsToUI();
      refreshAllViews();
      alert('Varmuuskopio palautettu onnistuneesti!');
      el.settingsModal.classList.remove('open');
    } catch (err) {
      alert('Virhe tiedoston tuonnissa: ' + err.message);
    }
  });

  // Load Demo Data Button
  el.btnLoadDemoData.addEventListener('click', () => {
    if (confirm('Ladataanko 30 päivää realistista esimerkkidataa (demo)? Tämä korvaa nykyisen paikallisen datasi.')) {
      generateDemoData();
      refreshAllViews();
      el.settingsModal.classList.remove('open');
    }
  });

  // Clear All Data Button (Fresh Clean Slate)
  el.btnClearAllData.addEventListener('click', () => {
    if (confirm('Haluatko varmasti tyhjentää kaikki omat merkinnät ja aloittaa puhtaalta pöydältä? Tätä ei voi perua ilman varmuuskopiota.')) {
      state.entries = [];
      state.meals = [];
      state.workouts = [];
      saveAllStateToStorage();
      refreshAllViews();
      el.settingsModal.classList.remove('open');
    }
  });
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * =========================================================================
 * DAY FORM & CRUD (Aamupaino, kalorit & nopeat merkinnät)
 * =========================================================================
 */
function bindDayFormEvents() {
  el.btnOpenModal.addEventListener('click', () => openDayModal());
  el.btnCloseModal.addEventListener('click', closeDayModal);
  el.btnCancelModal.addEventListener('click', closeDayModal);
  el.entryModal.addEventListener('click', (e) => {
    if (e.target === el.entryModal) closeDayModal();
  });

  const onWeightOrCalChange = () => {
    const weight = parseFloat(el.formWeight.value);
    const cals = parseInt(el.formCalories.value, 10) || state.settings.calorie_target;
    if (weight && weight > 0) {
      const rec = calculateRecommendedMacros(weight, cals);
      el.previewP.textContent = rec.protein;
      el.previewF.textContent = rec.fat;
      el.previewC.textContent = rec.carbs;
    } else {
      el.previewP.textContent = '-';
      el.previewF.textContent = '-';
      el.previewC.textContent = '-';
    }
  };
  el.formWeight.addEventListener('input', onWeightOrCalChange);
  el.formCalories.addEventListener('input', onWeightOrCalChange);

  el.btnAutofillMacros.addEventListener('click', () => {
    const weight = parseFloat(el.formWeight.value);
    const cals = parseInt(el.formCalories.value, 10) || state.settings.calorie_target;
    if (!weight) {
      alert('Syötä aamupaino ensin.');
      el.formWeight.focus();
      return;
    }
    const rec = calculateRecommendedMacros(weight, cals);
    el.formProtein.value = rec.protein;
    el.formFat.value = rec.fat;
    el.formCarbs.value = rec.carbs;
    updateFormMacroSum();
  });

  const updateFormMacroSum = () => {
    const p = parseFloat(el.formProtein.value) || 0;
    const c = parseFloat(el.formCarbs.value) || 0;
    const f = parseFloat(el.formFat.value) || 0;
    el.macroSumKcal.textContent = Math.round(p * 4 + c * 4 + f * 9);
  };
  el.formProtein.addEventListener('input', updateFormMacroSum);
  el.formCarbs.addEventListener('input', updateFormMacroSum);
  el.formFat.addEventListener('input', updateFormMacroSum);

  el.formWorkout.addEventListener('change', () => {
    el.workoutDetailsWrap.style.display = el.formWorkout.checked ? 'flex' : 'none';
  });

  setupRatingButtons(el.workoutMoodStars, el.formWorkoutMood);
  setupRatingButtons(el.recoveryStars, el.formRecovery);
  el.entryForm.addEventListener('submit', handleDayFormSubmit);
}

function openDayModal(id = null) {
  if (id) {
    el.modalTitle.textContent = 'Muokkaa päiväkirjamerkintää';
    const entry = state.entries.find(e => e.id === id);
    if (entry) {
      el.entryId.value = entry.id;
      el.formDate.value = entry.date;
      el.formWeight.value = entry.weight;
      el.formCalories.value = entry.calories;
      el.formProtein.value = entry.protein !== null ? entry.protein : '';
      el.formCarbs.value = entry.carbs !== null ? entry.carbs : '';
      el.formFat.value = entry.fat !== null ? entry.fat : '';
      el.formWorkout.checked = !!entry.workout;
      el.workoutDetailsWrap.style.display = entry.workout ? 'flex' : 'none';
      el.formWorkoutNotes.value = entry.workout_notes || '';
      setRatingActive(el.workoutMoodStars, el.formWorkoutMood, entry.workout_mood);
      setRatingActive(el.recoveryStars, el.formRecovery, entry.recovery);

      const rec = calculateRecommendedMacros(entry.weight, entry.calories);
      el.previewP.textContent = rec.protein;
      el.previewF.textContent = rec.fat;
      el.previewC.textContent = rec.carbs;
    }
  } else {
    el.modalTitle.textContent = 'Uusi päiväkirjamerkintä';
    el.entryForm.reset();
    el.entryId.value = '';
    el.formDate.value = state.activeDate;
    el.formCalories.value = state.settings.calorie_target || 2400;

    if (state.entries.length > 0) {
      const latest = state.entries[state.entries.length - 1];
      el.formWeight.value = latest.weight;
      const rec = calculateRecommendedMacros(latest.weight, state.settings.calorie_target);
      el.previewP.textContent = rec.protein;
      el.previewF.textContent = rec.fat;
      el.previewC.textContent = rec.carbs;
    }
    el.workoutDetailsWrap.style.display = 'none';
    setRatingActive(el.workoutMoodStars, el.formWorkoutMood, null);
    setRatingActive(el.recoveryStars, el.formRecovery, null);
  }
  el.entryModal.classList.add('open');
}

function closeDayModal() {
  el.entryModal.classList.remove('open');
}

function handleDayFormSubmit(e) {
  e.preventDefault();
  const id = el.entryId.value;
  const date = el.formDate.value;
  const weight = parseFloat(el.formWeight.value);
  const calories = parseInt(el.formCalories.value, 10);
  const protein = el.formProtein.value !== '' ? parseFloat(el.formProtein.value) : null;
  const carbs = el.formCarbs.value !== '' ? parseFloat(el.formCarbs.value) : null;
  const fat = el.formFat.value !== '' ? parseFloat(el.formFat.value) : null;
  const workout = el.formWorkout.checked ? 1 : 0;
  const workout_notes = el.formWorkoutNotes.value.trim();
  const workout_mood = el.formWorkoutMood.value ? parseInt(el.formWorkoutMood.value, 10) : null;
  const recovery = el.formRecovery.value ? parseInt(el.formRecovery.value, 10) : null;

  if (id) {
    const entry = state.entries.find(en => String(en.id) === String(id));
    if (entry) {
      Object.assign(entry, { date, weight, calories, protein, carbs, fat, workout, workout_notes, workout_mood, recovery });
    }
  } else {
    // Check if entry for date exists
    const existing = state.entries.find(en => en.date === date);
    if (existing) {
      Object.assign(existing, { weight, calories, protein, carbs, fat, workout, workout_notes, workout_mood, recovery });
    } else {
      state.entries.push({
        id: Date.now(),
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
      });
    }
  }

  saveToStorage(STORAGE_KEYS.ENTRIES, state.entries);
  closeDayModal();
  refreshAllViews();
}

window.editDayEntry = (id) => openDayModal(id);
window.deleteDayEntry = (id) => {
  if (confirm('Poistetaanko tämä merkintä?')) {
    state.entries = state.entries.filter(e => String(e.id) !== String(id));
    saveToStorage(STORAGE_KEYS.ENTRIES, state.entries);
    refreshAllViews();
  }
};

/**
 * =========================================================================
 * LIFESUM MEAL TRACKER & FOOD SCANNER
 * =========================================================================
 */
function bindLifesumMealsEvents() {
  el.mealsActiveDate.addEventListener('change', () => {
    state.activeDate = el.mealsActiveDate.value;
    renderMealsForActiveDate();
  });

  el.btnPrevDay.addEventListener('click', () => {
    const d = new Date(state.activeDate);
    d.setDate(d.getDate() - 1);
    state.activeDate = d.toISOString().split('T')[0];
    el.mealsActiveDate.value = state.activeDate;
    renderMealsForActiveDate();
  });

  el.btnNextDay.addEventListener('click', () => {
    const d = new Date(state.activeDate);
    d.setDate(d.getDate() + 1);
    state.activeDate = d.toISOString().split('T')[0];
    el.mealsActiveDate.value = state.activeDate;
    renderMealsForActiveDate();
  });

  el.btnToday.addEventListener('click', () => {
    state.activeDate = new Date().toISOString().split('T')[0];
    el.mealsActiveDate.value = state.activeDate;
    renderMealsForActiveDate();
  });

  document.querySelectorAll('.btn-add-to-meal').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentMealType = btn.dataset.meal;
      el.targetMealType.value = state.currentMealType;
      openFoodModal();
    });
  });

  el.btnOpenScanner.addEventListener('click', () => openFoodModal('scanner'));
  el.btnQuickAddFood.addEventListener('click', () => openFoodModal('search'));
  el.mealPortionG.addEventListener('input', updatePortionCalculations);
  el.btnAddFoodToMeal.addEventListener('click', handleAddFoodToMeal);
}

function renderMealsForActiveDate() {
  const dateStr = state.activeDate;
  const dayMeals = state.meals.filter(m => m.date === dateStr);

  const totalCals = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalP = dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalC = dayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalF = dayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  const targetCals = state.settings.calorie_target || 2400;

  // Use recorded day weight or latest weight for dynamic macro targets
  const dayEntry = state.entries.find(e => e.date === dateStr);
  const latestEntry = state.entries.length > 0 ? state.entries[state.entries.length - 1] : null;
  const currentWeight = dayEntry ? dayEntry.weight : (latestEntry ? latestEntry.weight : 78);

  const macroTargets = calculateRecommendedMacros(currentWeight, targetCals);

  // Calorie ring
  const remaining = Math.max(0, targetCals - totalCals);
  el.mealsRemainCals.textContent = remaining;
  el.mealsEatenCals.textContent = Math.round(totalCals);
  el.mealsTargetCals.textContent = targetCals;

  const ringPct = Math.min(1, totalCals / targetCals);
  el.ringCalProgress.style.strokeDashoffset = 440 - (ringPct * 440);
  el.ringCalProgress.style.stroke = totalCals > targetCals + 200 ? '#b45309' : '#1a4731';

  // Macro bars
  el.mealsPSummary.textContent = `${Math.round(totalP)} / ${macroTargets.protein} g`;
  el.mealsPBar.style.width = `${Math.min(100, Math.round((totalP / macroTargets.protein) * 100))}%`;

  el.mealsCSummary.textContent = `${Math.round(totalC)} / ${macroTargets.carbs} g`;
  el.mealsCBar.style.width = `${Math.min(100, Math.round((totalC / macroTargets.carbs) * 100))}%`;

  el.mealsFSummary.textContent = `${Math.round(totalF)} / ${macroTargets.fat} g`;
  el.mealsFBar.style.width = `${Math.min(100, Math.round((totalF / macroTargets.fat) * 100))}%`;

  // Render meal groups
  renderMealGroupList('breakfast', dayMeals.filter(m => m.meal_type === 'breakfast'), el.listBreakfast, el.subBreakfast);
  renderMealGroupList('lunch', dayMeals.filter(m => m.meal_type === 'lunch'), el.listLunch, el.subLunch);
  renderMealGroupList('dinner', dayMeals.filter(m => m.meal_type === 'dinner'), el.listDinner, el.subDinner);
  renderMealGroupList('snack', dayMeals.filter(m => m.meal_type === 'snack'), el.listSnack, el.subSnack);
}

function renderMealGroupList(mealType, items, listElem, subElem) {
  let subCals = 0;
  listElem.innerHTML = '';
  if (!items || items.length === 0) {
    listElem.innerHTML = `<div class="empty-meal-msg">Ei vielä ruokia</div>`;
    subElem.textContent = '0 kcal';
    return;
  }
  items.forEach(item => {
    subCals += item.calories;
    const row = document.createElement('div');
    row.className = 'meal-item-row';
    row.innerHTML = `
      <div class="meal-item-left">
        <span class="mil-name">${escapeHtml(item.food_name)} ${item.brand ? `<small style="color:#8a7d6e">(${escapeHtml(item.brand)})</small>` : ''}</span>
        <span class="mil-meta">${item.portion_g} g • P: ${item.protein} g | H: ${item.carbs} g | R: ${item.fat} g</span>
      </div>
      <div class="meal-item-right">
        <span class="mil-cals">${Math.round(item.calories)} kcal</span>
        <button class="btn-del-item" onclick="window.deleteMealItem('${item.id}')" title="Poista ruoka">✕</button>
      </div>
    `;
    listElem.appendChild(row);
  });
  subElem.textContent = `${Math.round(subCals)} kcal`;
}

window.deleteMealItem = (id) => {
  state.meals = state.meals.filter(m => String(m.id) !== String(id));
  saveToStorage(STORAGE_KEYS.MEALS, state.meals);
  syncDayTotalsFromMeals(state.activeDate);
  refreshAllViews();
};

/**
 * =========================================================================
 * BARCODE SCANNER & OPEN FOOD FACTS (Direct Browser Fetch)
 * =========================================================================
 */
function bindBarcodeScannerEvents() {
  el.btnCloseFoodModal.addEventListener('click', closeFoodModal);
  el.foodModal.addEventListener('click', (e) => {
    if (e.target === el.foodModal) closeFoodModal();
  });

  el.tabBtnScanner.addEventListener('click', () => switchFoodModalTab('scanner'));
  el.tabBtnSearch.addEventListener('click', () => switchFoodModalTab('search'));
  el.tabBtnManual.addEventListener('click', () => switchFoodModalTab('manual'));

  el.btnToggleCamera.addEventListener('click', toggleCamera);
  el.btnSwitchCamera.addEventListener('click', switchCameraFacing);

  el.btnFetchBarcode.addEventListener('click', () => {
    const code = el.manualBarcodeInput.value.trim();
    if (code) lookupBarcode(code);
  });

  el.manualBarcodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = el.manualBarcodeInput.value.trim();
      if (code) lookupBarcode(code);
    }
  });

  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      el.manualBarcodeInput.value = code;
      lookupBarcode(code);
    });
  });

  el.foodSearchInput.addEventListener('input', debounce(() => {
    const q = el.foodSearchInput.value.trim();
    searchLocalFoodCatalog(q);
  }, 200));

  el.createFoodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const food = {
      name: document.getElementById('mf-name').value.trim(),
      brand: document.getElementById('mf-brand').value.trim(),
      barcode: document.getElementById('mf-barcode').value.trim() || null,
      calories_100g: parseFloat(document.getElementById('mf-cal').value),
      protein_100g: parseFloat(document.getElementById('mf-p').value || 0),
      carbs_100g: parseFloat(document.getElementById('mf-c').value || 0),
      fat_100g: parseFloat(document.getElementById('mf-f').value || 0),
      serving_size_g: 100
    };

    state.foods.push(food);
    saveToStorage(STORAGE_KEYS.FOODS, state.foods);
    selectProductForPortion(food);
  });
}

function openFoodModal(initialTab = 'scanner') {
  el.foodModal.classList.add('open');
  switchFoodModalTab(initialTab);
}

function closeFoodModal() {
  stopCamera();
  el.foodModal.classList.remove('open');
  el.selectedProductCard.style.display = 'none';
  el.scannerStatusMsg.style.display = 'none';
}

function switchFoodModalTab(tabName) {
  el.tabBtnScanner.classList.toggle('active', tabName === 'scanner');
  el.tabBtnSearch.classList.toggle('active', tabName === 'search');
  el.tabBtnManual.classList.toggle('active', tabName === 'manual');

  el.viewScanner.style.display = tabName === 'scanner' ? 'flex' : 'none';
  el.viewSearch.style.display = tabName === 'search' ? 'flex' : 'none';
  el.viewManualFood.style.display = tabName === 'manual' ? 'block' : 'none';

  if (tabName === 'scanner') startCamera();
  else stopCamera();

  if (tabName === 'search') searchLocalFoodCatalog(el.foodSearchInput.value.trim());
}

async function startCamera() {
  if (state.scannerStream) return;
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showScannerStatus('Kameratukea ei ole saatavilla selaimessa. Syötä koodi käsin alta.', 'error');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: state.cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    state.scannerStream = stream;
    el.scannerVideo.srcObject = stream;
    el.btnToggleCamera.textContent = 'Pysäytä kamera';
    showScannerStatus('Kamera aktiivinen. Kohdista viivakoodi laatikkoon.', 'info');

    if ('BarcodeDetector' in window) {
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a'] });
      state.scannerInterval = setInterval(async () => {
        if (!state.scannerStream || el.scannerVideo.readyState < 2) return;
        try {
          const codes = await detector.detect(el.scannerVideo);
          if (codes.length > 0) {
            const raw = codes[0].rawValue;
            stopCamera();
            el.manualBarcodeInput.value = raw;
            lookupBarcode(raw);
          }
        } catch (_) {}
      }, 500);
    }
  } catch (err) {
    showScannerStatus('Kameran käyttöoikeutta ei myönnetty tai kamera ei ole käytettävissä. Syötä koodi käsin alta.', 'error');
  }
}

function stopCamera() {
  if (state.scannerInterval) {
    clearInterval(state.scannerInterval);
    state.scannerInterval = null;
  }
  if (state.scannerStream) {
    state.scannerStream.getTracks().forEach(t => t.stop());
    state.scannerStream = null;
    el.scannerVideo.srcObject = null;
    el.btnToggleCamera.textContent = 'Käynnistä kamera';
  }
}

function toggleCamera() {
  if (state.scannerStream) {
    stopCamera();
    showScannerStatus('Kamera pysäytetty.', 'info');
  } else {
    startCamera();
  }
}

function switchCameraFacing() {
  state.cameraFacing = state.cameraFacing === 'environment' ? 'user' : 'environment';
  stopCamera();
  startCamera();
}

function showScannerStatus(msg, type = 'info') {
  el.scannerStatusMsg.textContent = msg;
  el.scannerStatusMsg.className = `scanner-status ${type}`;
}

/**
 * Direct Barcode lookup: Local Catalog -> Open Food Facts API
 */
async function lookupBarcode(barcode) {
  showScannerStatus(`Haetaan koodilla ${barcode}...`, 'info');

  // 1. Check local catalog
  const foundLocal = state.foods.find(f => f.barcode === barcode);
  if (foundLocal) {
    showScannerStatus(`Löytyi tuotemuistista: ${foundLocal.name}`, 'success');
    selectProductForPortion(foundLocal);
    return;
  }

  // 2. Direct Open Food Facts API call
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
    const data = await res.json();
    if (data.status === 1 && data.product) {
      const p = data.product;
      const n = p.nutriments || {};
      const name = p.product_name_fi || p.product_name || 'Tuntematon tuote';
      const brand = p.brands || '';
      const calories = n['energy-kcal_100g'] !== undefined ? n['energy-kcal_100g'] : (n.energy_100g ? Math.round(n.energy_100g / 4.184) : 0);
      const protein = n.proteins_100g || 0;
      const carbs = n.carbohydrates_100g || 0;
      const fat = n.fat_100g || 0;

      const newFood = {
        barcode,
        name,
        brand,
        calories_100g: Math.round(calories * 10) / 10,
        protein_100g: Math.round(protein * 10) / 10,
        carbs_100g: Math.round(carbs * 10) / 10,
        fat_100g: Math.round(fat * 10) / 10,
        serving_size_g: 100
      };

      state.foods.push(newFood);
      saveToStorage(STORAGE_KEYS.FOODS, state.foods);
      showScannerStatus(`Löytyi Open Food Factsista: ${name}`, 'success');
      selectProductForPortion(newFood);
      return;
    }
  } catch (err) {
    console.warn('Open Food Facts API error:', err);
  }

  showScannerStatus(`Tuotetta ei löytynyt koodilla ${barcode}. Voit luoda sen käsin 'Luo uusi tuote käsin' -välilehdeltä.`, 'error');
  document.getElementById('mf-barcode').value = barcode;
}

function searchLocalFoodCatalog(query) {
  el.foodResultsList.innerHTML = '';
  const filtered = query
    ? state.foods.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || (f.brand && f.brand.toLowerCase().includes(query.toLowerCase())))
    : state.foods;

  if (filtered.length === 0) {
    el.foodResultsList.innerHTML = `<div class="empty-meal-msg">Ei tuotteita tuotemuistissa</div>`;
    return;
  }

  filtered.slice(0, 30).forEach(f => {
    const item = document.createElement('div');
    item.className = 'food-result-item';
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(f.name)}</strong> ${f.brand ? `<small style="color:#8a7d6e">(${escapeHtml(f.brand)})</small>` : ''}<br>
        <small style="color:#94a3b8">${f.calories_100g} kcal / 100g • P: ${f.protein_100g}g | H: ${f.carbs_100g}g | R: ${f.fat_100g}g</small>
      </div>
      <button class="btn btn-small btn-secondary">Valitse</button>
    `;
    item.addEventListener('click', () => selectProductForPortion(f));
    el.foodResultsList.appendChild(item);
  });
}

function selectProductForPortion(food) {
  state.selectedFood = food;
  el.prodName.textContent = food.name;
  el.prodBrand.textContent = `${food.brand || ''} ${food.barcode ? '• EAN: ' + food.barcode : ''}`;
  el.prodCal100g.textContent = `${food.calories_100g} kcal / 100g`;
  el.prodP100g.textContent = `${food.protein_100g} g`;
  el.prodC100g.textContent = `${food.carbs_100g} g`;
  el.prodF100g.textContent = `${food.fat_100g} g`;

  el.selectedProductCard.style.display = 'flex';
  updatePortionCalculations();
  el.selectedProductCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updatePortionCalculations() {
  if (!state.selectedFood) return;
  const portionG = parseFloat(el.mealPortionG.value) || 0;
  const scale = portionG / 100;

  const cals = Math.round(state.selectedFood.calories_100g * scale);
  const p = Math.round(state.selectedFood.protein_100g * scale * 10) / 10;
  const c = Math.round(state.selectedFood.carbs_100g * scale * 10) / 10;
  const f = Math.round(state.selectedFood.fat_100g * scale * 10) / 10;

  el.portionCals.textContent = `${cals} kcal`;
  el.portionP.textContent = `${p} g`;
  el.portionC.textContent = `${c} g`;
  el.portionF.textContent = `${f} g`;
}

function handleAddFoodToMeal() {
  if (!state.selectedFood) return;
  const portionG = parseFloat(el.mealPortionG.value) || 0;
  if (portionG <= 0) return alert('Anna annoskoko grammoina.');

  const scale = portionG / 100;
  const mealItem = {
    id: Date.now(),
    date: state.activeDate,
    meal_type: el.targetMealType.value,
    food_name: state.selectedFood.name,
    brand: state.selectedFood.brand || '',
    barcode: state.selectedFood.barcode || '',
    portion_g: portionG,
    calories: Math.round(state.selectedFood.calories_100g * scale),
    protein: Math.round(state.selectedFood.protein_100g * scale * 10) / 10,
    carbs: Math.round(state.selectedFood.carbs_100g * scale * 10) / 10,
    fat: Math.round(state.selectedFood.fat_100g * scale * 10) / 10
  };

  state.meals.push(mealItem);
  saveToStorage(STORAGE_KEYS.MEALS, state.meals);
  syncDayTotalsFromMeals(state.activeDate);
  closeFoodModal();
  refreshAllViews();
}

/**
 * =========================================================================
 * STRONG WORKOUT LOGGER & REST TIMER
 * =========================================================================
 */
function bindStrongWorkoutEvents() {
  // Start custom empty workout
  if (el.btnStartCustomWorkout) {
    el.btnStartCustomWorkout.addEventListener('click', () => {
      startNewWorkoutSession('Oma salitreeni', []);
    });
  }

  // Start from template
  el.btnStartWorkout.addEventListener('click', () => {
    const templateName = el.workoutTemplateSelect.value || 'Oma salitreeni';
    let exercises = [];
    if (templateName === 'Push / Työntävät') {
      exercises = ['Penkkipunnerrus tangolla', 'Pystypunnerrus tangolla', 'Ojentajapunnerrus taljassa'];
    } else if (templateName === 'Pull / Vetävät') {
      exercises = ['Maastaveto', 'Leuanveto lisäpainolla', 'Hauiskääntö tangolla'];
    } else if (templateName === 'Legs / Jalat & Vatsat') {
      exercises = ['Takakyykky tangolla', 'Jalkaprässi', 'Reiden koukistus laitteessa'];
    } else if (templateName === 'Full Body / Koko keho') {
      exercises = ['Takakyykky tangolla', 'Penkkipunnerrus tangolla', 'Leuanveto omalla painolla'];
    } else {
      const custom = (state.customTemplates || []).find(t => t.name === templateName);
      if (custom && custom.exercises) {
        exercises = custom.exercises;
      }
    }
    startNewWorkoutSession(templateName, exercises);
  });

  el.btnCancelWorkout.addEventListener('click', () => {
    if (confirm('Haluatko keskeyttää treenin tallentamatta?')) {
      el.activeWorkoutCard.style.display = 'none';
      state.activeWorkout = null;
    }
  });

  el.btnAddExercise.addEventListener('click', openExercisePickerModal);

  if (el.btnSaveAsTemplate) {
    el.btnSaveAsTemplate.addEventListener('click', handleSaveAsTemplate);
  }

  el.btnFinishWorkout.addEventListener('click', handleFinishWorkout);

  // Exercise Picker Modal Events
  if (el.btnCloseExercisePicker) {
    el.btnCloseExercisePicker.addEventListener('click', closeExercisePickerModal);
  }
  if (el.exercisePickerModal) {
    el.exercisePickerModal.addEventListener('click', (e) => {
      if (e.target === el.exercisePickerModal) closeExercisePickerModal();
    });
  }
  if (el.exerciseSearchInput) {
    el.exerciseSearchInput.addEventListener('input', renderExercisePickerList);
  }
  if (el.exerciseCatPills) {
    el.exerciseCatPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (btn && btn.dataset.cat) {
        state.exerciseFilterCat = btn.dataset.cat;
        el.exerciseCatPills.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderExercisePickerList();
      }
    });
  }
  if (el.btnCreateCustomExercise) {
    el.btnCreateCustomExercise.addEventListener('click', handleCreateCustomExercise);
  }
  if (el.customExerciseInput) {
    el.customExerciseInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCreateCustomExercise();
      }
    });
  }

  document.querySelectorAll('.btn-timer-preset').forEach(btn => {
    if (btn.dataset.sec) {
      btn.addEventListener('click', () => startRestTimer(parseInt(btn.dataset.sec, 10)));
    }
  });

  el.btnTimerPlus30.addEventListener('click', () => {
    state.restTimer.remainingSec += 30;
    updateRestTimerDisplay();
  });

  el.btnTimerStop.addEventListener('click', stopRestTimer);
}

function populateCustomTemplatesDropdown() {
  if (!el.customTemplatesOptgroup) return;
  el.customTemplatesOptgroup.innerHTML = '';
  if (state.customTemplates && state.customTemplates.length > 0) {
    el.customTemplatesOptgroup.style.display = 'block';
    state.customTemplates.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = `★ ${t.name} (${t.exercises ? t.exercises.length : 0} liikettä)`;
      el.customTemplatesOptgroup.appendChild(opt);
    });
  } else {
    el.customTemplatesOptgroup.style.display = 'none';
  }
}

function startNewWorkoutSession(name, exercises = []) {
  state.activeWorkout = { name, date: state.activeDate };
  el.workoutSessionName.value = name;
  el.workoutSessionDate.value = state.activeDate;
  el.exercisesContainer.innerHTML = '';
  el.activeWorkoutCard.style.display = 'flex';

  if (!exercises || exercises.length === 0) {
    el.exercisesContainer.innerHTML = `
      <div class="empty-workout-msg" id="empty-workout-msg">
        💪 <strong>Treeni aloitettu!</strong><br>
        Valitse omat liikkeet klikkaamalla alla olevaa <strong>"＋ Valitse / lisää liike"</strong> -painiketta.
      </div>
    `;
  } else {
    exercises.forEach(exName => addExerciseBlockToSession(exName));
  }

  el.activeWorkoutCard.scrollIntoView({ behavior: 'smooth' });
}

function getPreviousExerciseSets(exerciseName) {
  // Query previous workouts sorted by date desc
  for (const w of [...state.workouts].reverse()) {
    if (w.sets && w.sets.length > 0) {
      const matched = w.sets.filter(s => s.exercise_name === exerciseName);
      if (matched.length > 0) {
        return { date: w.date, sets: matched };
      }
    }
  }
  return null;
}

function addExerciseBlockToSession(exerciseName) {
  const emptyMsg = document.getElementById('empty-workout-msg');
  if (emptyMsg) emptyMsg.remove();

  const block = document.createElement('div');
  block.className = 'exercise-block';
  block.dataset.exercise = exerciseName;

  const prev = getPreviousExerciseSets(exerciseName);
  let prevHint = 'Ei aiempaa suoritusta';
  let prevSets = [];
  if (prev) {
    prevSets = prev.sets;
    prevHint = `Edellinen (${prev.date}): ${prevSets.map(s => `${s.weight_kg}kg×${s.reps}`).join(', ')}`;
  }

  block.innerHTML = `
    <div class="exercise-header">
      <div class="ex-title-wrap">
        <h4 class="ex-title">${escapeHtml(exerciseName)}</h4>
        <span class="ex-prev-hint">${prevHint}</span>
      </div>
      <div class="ex-header-actions">
        <button type="button" class="btn btn-small btn-secondary btn-add-set">＋ Lisää sarja</button>
        <button type="button" class="btn btn-small btn-danger btn-remove-ex" title="Poista tämä liike">✕ Poista liike</button>
      </div>
    </div>
    <table class="sets-table">
      <thead>
        <tr>
          <th style="width: 40px;">Sarja</th>
          <th>Edellinen</th>
          <th>kg</th>
          <th>Toistot</th>
          <th>RPE</th>
          <th style="width: 50px;">Valmis</th>
          <th style="width: 30px;"></th>
        </tr>
      </thead>
      <tbody class="sets-tbody"></tbody>
    </table>
  `;

  const tbody = block.querySelector('.sets-tbody');
  for (let i = 1; i <= 3; i++) {
    const p = prevSets[i - 1];
    addSetRow(tbody, i, p ? `${p.weight_kg} kg × ${p.reps}` : '-', p ? p.weight_kg : 60, p ? p.reps : 8);
  }

  block.querySelector('.btn-add-set').addEventListener('click', () => {
    const curCount = tbody.querySelectorAll('tr').length;
    addSetRow(tbody, curCount + 1, '-', 60, 8);
  });

  block.querySelector('.btn-remove-ex').addEventListener('click', () => {
    if (confirm(`Poistetaanko liike "${exerciseName}" tästä treenistä?`)) {
      block.remove();
      if (el.exercisesContainer.querySelectorAll('.exercise-block').length === 0) {
        el.exercisesContainer.innerHTML = `
          <div class="empty-workout-msg" id="empty-workout-msg">
            Ei vielä lisättyjä liikkeitä.<br>
            Klikkaa alla olevaa <strong>"＋ Valitse / lisää liike"</strong> -painiketta valitaksesi liikkeet!
          </div>
        `;
      }
    }
  });

  el.exercisesContainer.appendChild(block);
}

function addSetRow(tbody, setNumber, prevText, defWeight, defReps) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="set-idx">${setNumber}</td>
    <td class="prev-set-text">${prevText}</td>
    <td><input type="number" class="set-input-num set-weight" value="${defWeight}" step="0.5" min="0"></td>
    <td><input type="number" class="set-input-num set-reps" value="${defReps}" min="1"></td>
    <td><input type="number" class="set-input-rpe set-rpe" placeholder="8" min="5" max="10" step="0.5"></td>
    <td><button type="button" class="btn-check-set" title="Kuittaa sarja">✓</button></td>
    <td><button type="button" class="btn-remove-set" title="Poista sarja">✕</button></td>
  `;

  const checkBtn = tr.querySelector('.btn-check-set');
  checkBtn.addEventListener('click', () => {
    checkBtn.classList.toggle('checked');
    if (checkBtn.classList.contains('checked')) {
      startRestTimer(90);
    }
  });

  tr.querySelector('.btn-remove-set').addEventListener('click', () => {
    tr.remove();
    tbody.querySelectorAll('tr').forEach((row, idx) => {
      row.querySelector('.set-idx').textContent = idx + 1;
    });
  });

  tbody.appendChild(tr);
}

function openExercisePickerModal() {
  if (el.exerciseSearchInput) el.exerciseSearchInput.value = '';
  state.exerciseFilterCat = 'all';
  if (el.exerciseCatPills) {
    el.exerciseCatPills.querySelectorAll('.chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === 'all');
    });
  }
  renderExercisePickerList();
  el.exercisePickerModal.classList.add('open');
  setTimeout(() => el.exerciseSearchInput && el.exerciseSearchInput.focus(), 150);
}

function closeExercisePickerModal() {
  el.exercisePickerModal.classList.remove('open');
}

function renderExercisePickerList() {
  if (!el.exercisePickerList) return;
  el.exercisePickerList.innerHTML = '';

  const query = (el.exerciseSearchInput ? el.exerciseSearchInput.value : '').trim().toLowerCase();
  const cat = state.exerciseFilterCat || 'all';

  // Merge presets and user custom exercises
  const allExercises = [...PRESET_EXERCISES, ...(state.customExercises || [])];

  const seen = new Set();
  const filtered = allExercises.filter(ex => {
    const key = ex.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);

    const matchQuery = !query || ex.name.toLowerCase().includes(query) || (ex.cat && ex.cat.toLowerCase().includes(query));
    const matchCat = cat === 'all' || ex.cat === cat;
    return matchQuery && matchCat;
  });

  if (filtered.length === 0) {
    el.exercisePickerList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 18px; font-size: 13px;">
        Ei hakua vastaavia liikkeitä. Voit luoda täysin oman liikkeen alla olevasta kentästä!
      </div>
    `;
    return;
  }

  filtered.forEach(ex => {
    const item = document.createElement('div');
    item.className = 'exercise-picker-item';
    item.innerHTML = `
      <div class="ex-picker-left">
        <span class="ex-picker-name">${escapeHtml(ex.name)}</span>
        <span class="ex-picker-cat">${escapeHtml(ex.cat || 'Oma liike')}</span>
      </div>
      <button type="button" class="btn btn-small btn-primary">＋ Lisää</button>
    `;
    item.addEventListener('click', () => {
      addExerciseBlockToSession(ex.name);
      closeExercisePickerModal();
    });
    el.exercisePickerList.appendChild(item);
  });
}

function handleCreateCustomExercise() {
  const name = (el.customExerciseInput.value || '').trim();
  if (!name) return;

  const newEx = { name, cat: 'Oma liike' };
  if (!state.customExercises) state.customExercises = [];
  state.customExercises.push(newEx);
  saveToStorage(STORAGE_KEYS.CUSTOM_EXERCISES, state.customExercises);

  el.customExerciseInput.value = '';
  addExerciseBlockToSession(name);
  closeExercisePickerModal();
}

function handleSaveAsTemplate() {
  const blocks = el.exercisesContainer.querySelectorAll('.exercise-block');
  if (blocks.length === 0) {
    alert('Lisää ensin vähintään yksi liike, jotta voit tallentaa sen treenipohjaksi.');
    return;
  }

  const defaultName = el.workoutSessionName.value.trim() || 'Oma treenipohja';
  const name = prompt('Anna treenipohjalle nimi:', defaultName);
  if (!name || !name.trim()) return;

  const trimmedName = name.trim();
  const exercises = Array.from(blocks).map(b => b.dataset.exercise);

  if (!state.customTemplates) state.customTemplates = [];
  const existingIdx = state.customTemplates.findIndex(t => t.name.toLowerCase() === trimmedName.toLowerCase());
  if (existingIdx >= 0) {
    if (!confirm(`Treenipohja nimellä "${trimmedName}" on jo olemassa. Haluatko korvata sen?`)) return;
    state.customTemplates[existingIdx] = { name: trimmedName, exercises };
  } else {
    state.customTemplates.push({ name: trimmedName, exercises });
  }

  saveToStorage(STORAGE_KEYS.CUSTOM_TEMPLATES, state.customTemplates);
  populateCustomTemplatesDropdown();
  alert(`Treenipohja "${trimmedName}" tallennettu! Voit valita sen jatkossa yläreunan pohjavalitsimesta.`);
}

function startRestTimer(seconds = 90) {
  stopRestTimer();
  state.restTimer.remainingSec = seconds;
  el.stickyRestTimer.style.display = 'block';
  updateRestTimerDisplay();

  state.restTimer.interval = setInterval(() => {
    state.restTimer.remainingSec--;
    updateRestTimerDisplay();
    if (state.restTimer.remainingSec <= 0) {
      stopRestTimer();
      playAudioChime();
      alert('⏰ Lepotauko päättyi! Aika seuraavalle sarjalle.');
    }
  }, 1000);
}

function stopRestTimer() {
  if (state.restTimer.interval) {
    clearInterval(state.restTimer.interval);
    state.restTimer.interval = null;
  }
  el.stickyRestTimer.style.display = 'none';
}

function updateRestTimerDisplay() {
  const m = Math.floor(state.restTimer.remainingSec / 60);
  const s = state.restTimer.remainingSec % 60;
  el.restTimerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function handleFinishWorkout() {
  const name = el.workoutSessionName.value.trim() || 'Salitreeni';
  const date = el.workoutSessionDate.value || state.activeDate;
  const sets = [];
  const exerciseBlocks = el.exercisesContainer.querySelectorAll('.exercise-block');

  exerciseBlocks.forEach(block => {
    const exName = block.dataset.exercise;
    const rows = block.querySelectorAll('.sets-tbody tr');
    rows.forEach((tr, idx) => {
      const weight = parseFloat(tr.querySelector('.set-weight').value) || 0;
      const reps = parseInt(tr.querySelector('.set-reps').value, 10) || 0;
      const rpe = parseFloat(tr.querySelector('.set-rpe').value) || null;
      const completed = tr.querySelector('.btn-check-set').classList.contains('checked') ? 1 : 0;
      sets.push({ exercise_name: exName, set_order: idx + 1, weight_kg: weight, reps, rpe, completed });
    });
  });

  const session = {
    id: Date.now(),
    date,
    name,
    notes: `${exerciseBlocks.length} liikettä, ${sets.length} sarjaa.`,
    duration_min: 65,
    rating: 5,
    sets
  };

  state.workouts.push(session);
  saveToStorage(STORAGE_KEYS.WORKOUTS, state.workouts);

  // Sync to entry if present
  const entry = state.entries.find(e => e.date === date);
  if (entry) {
    entry.workout = 1;
    entry.workout_notes = name;
    saveToStorage(STORAGE_KEYS.ENTRIES, state.entries);
  }

  el.activeWorkoutCard.style.display = 'none';
  stopRestTimer();
  refreshAllViews();
  alert('Treeni tallennettu onnistuneesti!');
}

function renderPastWorkouts() {
  el.workoutCountLabel.textContent = `${state.workouts.length} treeniä`;
  el.pastWorkoutsList.innerHTML = '';
  if (state.workouts.length === 0) {
    el.pastWorkoutsList.innerHTML = `<div class="empty-meal-msg">Ei vielä tallennettuja treenejä. Aloita uusi treeni yläpalkista!</div>`;
    return;
  }

  [...state.workouts].reverse().forEach(sess => {
    const card = document.createElement('div');
    card.className = 'past-workout-card';
    const exMap = {};
    let totalVol = 0;
    sess.sets.forEach(s => {
      totalVol += (s.weight_kg * s.reps);
      if (!exMap[s.exercise_name]) exMap[s.exercise_name] = [];
      exMap[s.exercise_name].push(`${s.weight_kg}kg×${s.reps}`);
    });

    const exLines = Object.keys(exMap).map(k => `<strong>${escapeHtml(k)}:</strong> ${exMap[k].join(', ')}`).join('<br>');
    card.innerHTML = `
      <div class="pwc-head">
        <div>
          <h4 class="pwc-title">${escapeHtml(sess.name)}</h4>
          <span class="pwc-date">${sess.date}</span>
        </div>
        <button class="btn-del-item" onclick="window.deleteWorkoutSession('${sess.id}')" title="Poista treeni">🗑️</button>
      </div>
      <div class="pwc-stats">
        <span>Sarjoja: <strong>${sess.sets.length}</strong></span>
        <span>Volyymi: <strong>${Math.round(totalVol)} kg</strong></span>
        <span>Kesto: <strong>${sess.duration_min} min</strong></span>
      </div>
      <div class="pwc-exercises-summary">${exLines}</div>
    `;
    el.pastWorkoutsList.appendChild(card);
  });
}

window.deleteWorkoutSession = (id) => {
  if (confirm('Poistetaanko tämä treenisessio?')) {
    state.workouts = state.workouts.filter(w => String(w.id) !== String(id));
    saveToStorage(STORAGE_KEYS.WORKOUTS, state.workouts);
    renderPastWorkouts();
  }
};

/**
 * =========================================================================
 * DASHBOARD & CHARTS
 * =========================================================================
 */
function updateDashboard() {
  const entries = state.entries;
  el.entryCountLabel.textContent = `${entries.length} merkintää`;
  entries.sort((a, b) => a.date.localeCompare(b.date));

  computeMovingAverages(entries);
  updateKPIs(entries);
  updateAnalytics();
  updateMacroSection(entries);
  renderWeightChart(entries);
  renderCaloriesChart(entries);
  renderTable([...entries].reverse());
}

function computeMovingAverages(entries) {
  for (let i = 0; i < entries.length; i++) {
    let calSum = 0, weightSum = 0, count = 0;
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      calSum += entries[j].calories;
      weightSum += entries[j].weight;
      count++;
    }
    entries[i].ma7Calories = Math.round(calSum / count);
    entries[i].ma7Weight = Math.round((weightSum / count) * 100) / 100;
  }
}

function updateKPIs(entries) {
  const targetCals = state.settings.calorie_target || 2400;
  el.kpiTargetCals.textContent = targetCals;
  el.statCurrentTargetCals.textContent = `${targetCals} kcal`;

  if (entries.length === 0) {
    el.kpiTodayDate.textContent = 'Ei merkintöjä';
    el.kpiTodayCals.textContent = '-';
    el.kpiTodayDelta.textContent = '-';
    el.kpiTodayProgress.style.width = '0%';
    el.kpi7dCals.textContent = '-';
    el.kpi7dCalDelta.textContent = '-';
    el.kpi7dCalProgress.style.width = '0%';
    el.kpiCurrentWeight.textContent = '-';
    el.kpi7dWeight.textContent = '-';
    el.kpiWeightTrendBadge.textContent = 'Ei dataa';
    el.kpiWeightChangeText.textContent = 'Aloita lisäämällä ensimmäinen merkintä';
    el.kpiTdeeVal.textContent = '-';
    el.tdeeStatusBadge.textContent = 'Ei dataa';
    return;
  }

  const latest = entries[entries.length - 1];
  el.kpiTodayDate.textContent = formatDateFi(latest.date);
  el.kpiTodayCals.textContent = latest.calories;
  const calDelta = latest.calories - targetCals;
  const deltaSign = calDelta > 0 ? `+${calDelta}` : `${calDelta}`;
  el.kpiTodayDelta.textContent = `(${deltaSign} kcal)`;
  el.kpiTodayDelta.className = 'kpi-delta ' + (calDelta > 200 ? 'delta-warn' : (calDelta < -400 ? 'delta-warn' : 'delta-good'));
  el.kpiTodayProgress.style.width = `${Math.min(100, Math.round((latest.calories / targetCals) * 100))}%`;

  const avg7dCals = latest.ma7Calories;
  el.kpi7dCals.textContent = avg7dCals;
  const avgDelta = avg7dCals - targetCals;
  const avgSign = avgDelta > 0 ? `+${avgDelta}` : `${avgDelta}`;
  el.kpi7dCalDelta.textContent = `${avgSign} kcal/pv`;
  el.kpi7dCalDelta.className = 'kpi-delta ' + (avgDelta > 150 ? 'delta-warn' : 'delta-good');
  el.kpi7dCalProgress.style.width = `${Math.min(100, Math.round((avg7dCals / targetCals) * 100))}%`;

  el.kpiCurrentWeight.textContent = latest.weight.toFixed(1);
  el.kpi7dWeight.textContent = latest.ma7Weight ? latest.ma7Weight.toFixed(1) : latest.weight.toFixed(1);

  if (entries.length >= 7) {
    const prev7 = entries[Math.max(0, entries.length - 8)];
    const weightDiff = latest.ma7Weight - prev7.ma7Weight;
    const diffSign = weightDiff > 0 ? `+${weightDiff.toFixed(2)}` : `${weightDiff.toFixed(2)}`;
    el.kpiWeightTrendBadge.textContent = `${diffSign} kg/vko`;
    el.kpiWeightTrendBadge.className = 'kpi-badge ' + (Math.abs(weightDiff) < 0.1 ? 'info' : (weightDiff < 0 ? 'success' : 'warning'));
    el.kpiWeightChangeText.textContent = `7 pv painomuutos liukuvasta keskiarvosta: ${diffSign} kg`;
  } else {
    el.kpiWeightTrendBadge.textContent = `${entries.length}/7 pv`;
    el.kpiWeightTrendBadge.className = 'kpi-badge info';
    el.kpiWeightChangeText.textContent = `Kerätään 7 pv vertailudataa (${entries.length} pv tallennettu)`;
  }
}

function updateAnalytics() {
  const entries = state.entries;
  const goalMode = state.settings.goal_mode || 'maintenance';

  if (entries.length < 7) {
    el.kpiTdeeVal.textContent = '-';
    el.tdeeStatusBadge.textContent = `Vaatii 7 pv (nyt ${entries.length})`;
    el.tdeeStatusBadge.className = 'kpi-badge warning';
    el.kpiTdeeInfo.textContent = 'TDEE lasketaan kun dataa on vähintään viikko';
    el.statWeightWeeklyRate.textContent = 'Ei tarpeeksi dataa';
    el.statEnergyBalance.textContent = '-';
    el.recCalVal.textContent = `${state.settings.calorie_target} kcal`;
    el.recReasoningText.innerHTML = `Kerää vähintään 7 päivää aamupainoa ja kaloreita, jotta järjestelmä arvioi tarkan kulutuksen.`;
    return;
  }

  const windowEntries = entries.slice(-30);
  const N = windowEntries.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, totalCals = 0;

  for (let i = 0; i < N; i++) {
    sumX += i;
    sumY += windowEntries[i].weight;
    sumXY += i * windowEntries[i].weight;
    sumXX += i * i;
    totalCals += windowEntries[i].calories;
  }

  const slope = (N * sumXY - sumX * sumY) / (N * sumXX - sumX * sumX);
  const weeklyWeightChange = slope * 7;
  const avgCals = totalCals / N;
  const dailyCaloricBalance = slope * 7700;
  const estimatedTDEE = Math.round(avgCals - dailyCaloricBalance);

  el.kpiTdeeVal.textContent = estimatedTDEE;
  el.tdeeStatusBadge.textContent = 'Aktiivinen arvio';
  el.tdeeStatusBadge.className = 'kpi-badge success';
  el.kpiTdeeInfo.textContent = `Kulutus n. ${estimatedTDEE} kcal/pv`;

  const weeklySign = weeklyWeightChange > 0 ? `+${weeklyWeightChange.toFixed(2)}` : weeklyWeightChange.toFixed(2);
  el.statWeightWeeklyRate.textContent = `${weeklySign} kg/vko`;
  const balanceSign = dailyCaloricBalance > 0 ? `+${Math.round(dailyCaloricBalance)}` : `${Math.round(dailyCaloricBalance)}`;
  el.statEnergyBalance.textContent = `${balanceSign} kcal/pv`;

  let recommendedCals = estimatedTDEE;
  let reasoning = '';

  if (goalMode === 'fat_loss') {
    recommendedCals = Math.max(1500, Math.round(estimatedTDEE - 400));
    reasoning = `Valittu tavoite: <strong>Painon pudotus</strong>.<br>Arvioitu kulutuksesi on <strong>${estimatedTDEE} kcal/pv</strong>. Suositeltu tavoite <strong>${recommendedCals} kcal/pv</strong> luo turvallisen -400 kcal/pv energiavajeen.`;
  } else if (goalMode === 'muscle_gain') {
    recommendedCals = Math.round(estimatedTDEE + 250);
    reasoning = `Valittu tavoite: <strong>Lihaskasvu (plussa)</strong>.<br>Arvioitu kulutuksesi on <strong>${estimatedTDEE} kcal/pv</strong>. Suositeltu tavoite <strong>${recommendedCals} kcal/pv</strong> tarjoaa hallitun +250 kcal/pv ylijäämän.`;
  } else {
    recommendedCals = estimatedTDEE;
    reasoning = `Valittu tavoite: <strong>Ylläpito / Recomp</strong>.<br>Arvioitu kulutuksesi on <strong>${estimatedTDEE} kcal/pv</strong>. Suositeltu tavoite <strong>${recommendedCals} kcal/pv</strong> pitää painon tasapainossa.`;
  }

  el.recCalVal.textContent = `${recommendedCals} kcal`;
  el.recReasoningText.innerHTML = reasoning;
}

function updateMacroSection(entries) {
  const targetCals = state.settings.calorie_target || 2400;
  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
  const currentWeight = latest ? latest.weight : 78;
  const rec = calculateRecommendedMacros(currentWeight, targetCals);

  el.macroTgtProtein.textContent = rec.protein;
  el.macroTgtProteinCal.textContent = `${rec.proteinKcal} kcal`;
  el.macroTgtFat.textContent = rec.fat;
  el.macroTgtFatCal.textContent = `${rec.fatKcal} kcal`;
  el.macroTgtCarbs.textContent = rec.carbs;
  el.macroTgtCarbsCal.textContent = `${rec.carbsKcal} kcal`;

  const actP = latest && latest.protein !== null ? latest.protein : null;
  const actF = latest && latest.fat !== null ? latest.fat : null;
  const actC = latest && latest.carbs !== null ? latest.carbs : null;

  renderMacroCard(actP, rec.protein, 4, el.macroActProtein, el.macroActProteinCal, el.barProtein, el.pctProtein, el.diffProtein);
  renderMacroCard(actF, rec.fat, 9, el.macroActFat, el.macroActFatCal, el.barFat, el.pctFat, el.diffFat);
  renderMacroCard(actC, rec.carbs, 4, el.macroActCarbs, el.macroActCarbsCal, el.barCarbs, el.pctCarbs, el.diffCarbs);
}

function renderMacroCard(actual, target, kcalMultiplier, elAct, elActCal, elBar, elPct, elDiff) {
  if (actual !== null && actual !== undefined) {
    elAct.textContent = actual;
    elActCal.textContent = `${Math.round(actual * kcalMultiplier)} kcal`;
    const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
    elBar.style.width = `${Math.min(100, pct)}%`;
    elPct.textContent = `${pct}%`;
    const diff = Math.round(actual - target);
    const diffSign = diff > 0 ? `+${diff}` : `${diff}`;
    elDiff.textContent = `${diffSign} g`;
    elDiff.className = diff === 0 ? '' : (diff > 0 ? 'delta-good' : 'delta-warn');
  } else {
    elAct.textContent = '-';
    elActCal.textContent = 'Ei syötetty';
    elBar.style.width = '0%';
    elPct.textContent = '0%';
    elDiff.textContent = 'Ei toteumaa';
    elDiff.className = '';
  }
}

function renderWeightChart(entries) {
  const svg = el.weightSvg;
  const tooltip = el.weightTooltip;
  svg.innerHTML = '';
  if (entries.length === 0) {
    svg.innerHTML = `<text x="400" y="130" fill="#8a7d6e" text-anchor="middle" font-size="14">Ei tallennettuja painomerkintöjä</text>`;
    return;
  }
  const width = 800, height = 260, pad = { top: 20, right: 20, bottom: 35, left: 50 };
  const plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;

  let minW = Math.min(...entries.map(e => e.weight)), maxW = Math.max(...entries.map(e => e.weight));
  if (minW === maxW) { minW -= 2; maxW += 2; }
  const yPadding = (maxW - minW) * 0.15 || 1;
  const yMin = Math.floor((minW - yPadding) * 2) / 2;
  const yMax = Math.ceil((maxW + yPadding) * 2) / 2;

  const getX = (index) => pad.left + (entries.length === 1 ? plotW / 2 : (index / (entries.length - 1)) * plotW);
  const getY = (val) => pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  for (let i = 0; i <= 4; i++) {
    const val = yMin + (i / 4) * (yMax - yMin);
    const y = getY(val);
    svg.appendChild(createSvgElement('line', { x1: pad.left, y1: y, x2: width - pad.right, y2: y, stroke: '#d4c9b0', 'stroke-width': 1, 'stroke-dasharray': i === 0 ? 'none' : '3,3' }));
    const label = createSvgElement('text', { x: pad.left - 8, y: y + 4, fill: '#8a7d6e', 'font-size': 10, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' });
    label.textContent = val.toFixed(1);
    svg.appendChild(label);
  }

  let maPathD = '';
  entries.forEach((e, i) => {
    if (e.ma7Weight) {
      const x = getX(i), y = getY(e.ma7Weight);
      maPathD += (maPathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }
  });
  if (maPathD) {
    svg.appendChild(createSvgElement('path', { d: maPathD, fill: 'none', stroke: '#b45309', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }

  let weightPathD = '';
  entries.forEach((e, i) => {
    const x = getX(i), y = getY(e.weight);
    weightPathD += (weightPathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
  });
  svg.appendChild(createSvgElement('path', { d: weightPathD, fill: 'none', stroke: '#1a4731', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.85 }));

  entries.forEach((e, i) => {
    const x = getX(i), y = getY(e.weight);
    const circle = createSvgElement('circle', { cx: x, cy: y, r: entries.length > 35 ? 2.5 : 4, fill: '#1a4731', stroke: '#fafaf7', 'stroke-width': 1.5 });
    svg.appendChild(circle);

    const hitArea = createSvgElement('circle', { cx: x, cy: y, r: 12, fill: 'transparent', style: 'cursor: pointer;' });
    hitArea.addEventListener('mouseenter', () => {
      circle.setAttribute('r', '6');
      circle.setAttribute('fill', '#ffffff');
      tooltip.innerHTML = `<strong>${formatDateFi(e.date)}</strong><br>Paino: <strong>${e.weight.toFixed(1)} kg</strong><br>7 pv ka: <strong>${e.ma7Weight ? e.ma7Weight.toFixed(1) + ' kg' : '-'}</strong>`;
      tooltip.style.opacity = '1';
      tooltip.style.left = `${Math.min(width - 150, Math.max(10, x - 50))}px`;
      tooltip.style.top = `${Math.max(10, y - 55)}px`;
    });
    hitArea.addEventListener('mouseleave', () => {
      circle.setAttribute('r', entries.length > 35 ? '2.5' : '4');
      circle.setAttribute('fill', '#1a4731');
      tooltip.style.opacity = '0';
    });
    svg.appendChild(hitArea);

    const step = Math.ceil(entries.length / 7);
    if (i % step === 0 || i === entries.length - 1) {
      const text = createSvgElement('text', { x, y: height - 10, fill: '#8a7d6e', 'font-size': 9, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
      text.textContent = e.date.substring(5);
      svg.appendChild(text);
    }
  });
}

function renderCaloriesChart(entries) {
  const svg = el.caloriesSvg;
  const tooltip = el.caloriesTooltip;
  svg.innerHTML = '';
  if (entries.length === 0) {
    svg.innerHTML = `<text x="400" y="130" fill="#8a7d6e" text-anchor="middle" font-size="14">Ei tallennettuja kalorimerkintöjä</text>`;
    return;
  }
  const width = 800, height = 260, pad = { top: 20, right: 20, bottom: 35, left: 50 };
  const plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;
  const targetCals = state.settings.calorie_target || 2400;

  const calValues = entries.map(e => e.calories).concat([targetCals]);
  const minC = Math.min(...calValues), maxC = Math.max(...calValues);
  const yMin = Math.max(0, Math.floor((minC - 300) / 200) * 200);
  const yMax = Math.ceil((maxC + 300) / 200) * 200;
  const getY = (val) => pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  for (let i = 0; i <= 4; i++) {
    const val = Math.round(yMin + (i / 4) * (yMax - yMin));
    const y = getY(val);
    svg.appendChild(createSvgElement('line', { x1: pad.left, y1: y, x2: width - pad.right, y2: y, stroke: '#d4c9b0', 'stroke-width': 1, 'stroke-dasharray': i === 0 ? 'none' : '3,3' }));
    const label = createSvgElement('text', { x: pad.left - 8, y: y + 4, fill: '#8a7d6e', 'font-size': 10, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' });
    label.textContent = val;
    svg.appendChild(label);
  }

  const targetY = getY(targetCals);
  svg.appendChild(createSvgElement('line', { x1: pad.left, y1: targetY, x2: width - pad.right, y2: targetY, stroke: '#b91c1c', 'stroke-width': 1.5, 'stroke-dasharray': '5,5' }));

  const count = entries.length;
  const barSlotW = plotW / count;
  const barW = Math.max(3, Math.min(20, barSlotW * 0.65));

  entries.forEach((e, i) => {
    const barX = pad.left + i * barSlotW + (barSlotW - barW) / 2;
    const barY = getY(e.calories);
    const barHeight = Math.max(2, (pad.top + plotH) - barY);

    const rect = createSvgElement('rect', { x: barX, y: barY, width: barW, height: barHeight, fill: '#1a4731', rx: 2, opacity: 0.85 });
    svg.appendChild(rect);

    const hitArea = createSvgElement('rect', { x: pad.left + i * barSlotW, y: pad.top, width: barSlotW, height: plotH, fill: 'transparent', style: 'cursor: pointer;' });
    hitArea.addEventListener('mouseenter', () => {
      rect.setAttribute('fill', '#2d6a4f');
      const dDiff = e.calories - targetCals;
      const dSign = dDiff > 0 ? `+${dDiff}` : `${dDiff}`;
      tooltip.innerHTML = `<strong>${formatDateFi(e.date)}</strong><br>Kalorit: <strong>${e.calories} kcal</strong> (${dSign})<br>Tavoite: <strong>${targetCals} kcal</strong><br>7 pv ka: <strong>${e.ma7Calories || '-'} kcal</strong>`;
      tooltip.style.opacity = '1';
      tooltip.style.left = `${Math.min(width - 160, Math.max(10, barX - 60))}px`;
      tooltip.style.top = `${Math.max(10, barY - 55)}px`;
    });
    hitArea.addEventListener('mouseleave', () => {
      rect.setAttribute('fill', '#1a4731');
      tooltip.style.opacity = '0';
    });
    svg.appendChild(hitArea);

    const step = Math.ceil(entries.length / 7);
    if (i % step === 0 || i === entries.length - 1) {
      const text = createSvgElement('text', { x: pad.left + i * barSlotW + barSlotW / 2, y: height - 10, fill: '#8a7d6e', 'font-size': 9, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
      text.textContent = e.date.substring(5);
      svg.appendChild(text);
    }
  });

  let calMaPathD = '';
  entries.forEach((e, i) => {
    if (e.ma7Calories) {
      const x = pad.left + i * barSlotW + barSlotW / 2, y = getY(e.ma7Calories);
      calMaPathD += (calMaPathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }
  });
  if (calMaPathD) {
    svg.appendChild(createSvgElement('path', { d: calMaPathD, fill: 'none', stroke: '#2d6a4f', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
}

function renderTable(entries) {
  const tbody = el.entriesTbody;
  tbody.innerHTML = '';
  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #8a7d6e; padding: 28px;">Ei merkintöjä. Aloita lisäämällä merkintä tai kokeile esimerkkidataa!</td></tr>`;
    return;
  }

  entries.forEach(e => {
    const tr = document.createElement('tr');
    const workoutContent = e.workout
      ? `<span class="badge-tag badge-workout">🏋️ Kyllä</span> ${e.workout_notes ? `<br><small style="color:#94a3b8">${escapeHtml(e.workout_notes)}</small>` : ''}`
      : `<span class="badge-tag badge-rest">Lepopäivä</span>`;

    const recoveryContent = e.recovery
      ? `<span>${e.recovery}/5</span>`
      : `<span style="color:#8a7d6e">-</span>`;

    tr.innerHTML = `
      <td class="td-date">${e.date}</td>
      <td class="td-num"><strong>${e.weight.toFixed(1)}</strong> kg</td>
      <td class="td-num"><strong>${e.calories}</strong> kcal</td>
      <td class="td-num" style="color:var(--macro-protein)">${e.protein !== null ? e.protein + ' g' : '-'}</td>
      <td class="td-num" style="color:var(--macro-carbs)">${e.carbs !== null ? e.carbs + ' g' : '-'}</td>
      <td class="td-num" style="color:var(--macro-fat)">${e.fat !== null ? e.fat + ' g' : '-'}</td>
      <td>${workoutContent}</td>
      <td>${recoveryContent}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon-action" onclick="window.editDayEntry('${e.id}')" title="Muokkaa">✏️</button>
          <button class="btn-icon-action del" onclick="window.deleteDayEntry('${e.id}')" title="Poista">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function setupRatingButtons(container, hiddenInput) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.rating-btn');
    if (!btn) return;
    const val = btn.dataset.val;
    if (hiddenInput.value === val) {
      hiddenInput.value = '';
      btn.classList.remove('active');
    } else {
      hiddenInput.value = val;
      container.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
}

function setRatingActive(container, hiddenInput, value) {
  hiddenInput.value = value || '';
  container.querySelectorAll('.rating-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === String(value));
  });
}

function createSvgElement(tag, attrs) {
  const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) elem.setAttribute(k, v);
  return elem;
}

function formatDateFi(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : dateStr;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Start PWA
document.addEventListener('DOMContentLoaded', init);
