/**
 * Kalori- ja Makrovahti - Frontend Application Logic
 * Lifesum Nutrition + Barcode Scanner + Strong Workout Logger
 */

// Global State
const state = {
  entries: [],
  settings: {
    calorie_target: 2400,
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

// DOM References
const el = {
  // Tabs
  navTabs: document.getElementById('main-nav-tabs'),
  tabContents: document.querySelectorAll('.tab-content'),

  // Header & Global Modals
  btnGenerateData: document.getElementById('btn-generate-data'),
  btnExport: document.getElementById('btn-export'),
  exportMenu: document.getElementById('export-menu'),
  importFileInput: document.getElementById('import-file-input'),
  btnOpenModal: document.getElementById('btn-open-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  entryModal: document.getElementById('entry-modal'),
  entryForm: document.getElementById('entry-form'),
  modalTitle: document.getElementById('modal-title'),
  btnResetData: document.getElementById('btn-reset-data'),

  // Dashboard KPIs
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

  // Analytics & Goals
  goalSelector: document.getElementById('goal-selector'),
  recCalVal: document.getElementById('rec-cal-val'),
  btnApplyRec: document.getElementById('btn-apply-rec'),
  recReasoningText: document.getElementById('rec-reasoning-text'),
  statWeightWeeklyRate: document.getElementById('stat-weight-weekly-rate'),
  statEnergyBalance: document.getElementById('stat-energy-balance'),
  statCurrentTargetCals: document.getElementById('stat-current-target-cals'),

  // Dashboard Macro Section
  globalCalorieTarget: document.getElementById('global-calorie-target'),
  btnSaveTarget: document.getElementById('btn-save-target'),
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

  // Table
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

  // Lifesum Meals Tab
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
  btnStartWorkout: document.getElementById('btn-start-workout'),
  activeWorkoutCard: document.getElementById('active-workout-card'),
  workoutSessionName: document.getElementById('workout-session-name'),
  workoutSessionDate: document.getElementById('workout-session-date'),
  exercisesContainer: document.getElementById('exercises-container'),
  btnAddExercise: document.getElementById('btn-add-exercise'),
  btnCancelWorkout: document.getElementById('btn-cancel-workout'),
  btnFinishWorkout: document.getElementById('btn-finish-workout'),
  pastWorkoutsList: document.getElementById('past-workouts-list'),
  workoutCountLabel: document.getElementById('workout-count-label')
};

/**
 * Macro calculation rules:
 * - Protein: 2.0 g * weight (kg) (4 kcal/g)
 * - Fat: 0.8 g * weight (kg) (9 kcal/g)
 * - Carbs: max(0, round((calorieTarget - proteinKcal - fatKcal) / 4))
 */
function calculateRecommendedMacros(weightKg, calorieTarget) {
  if (!weightKg || weightKg <= 0) {
    return { protein: 0, fat: 0, carbs: 0, proteinKcal: 0, fatKcal: 0, carbsKcal: 0 };
  }
  const protein = Math.round(weightKg * 2.0);
  const proteinKcal = protein * 4;
  const fat = Math.round(weightKg * 0.8);
  const fatKcal = fat * 9;
  const remainingKcal = (calorieTarget || 2400) - proteinKcal - fatKcal;
  const carbs = Math.max(0, Math.round(remainingKcal / 4));
  const carbsKcal = carbs * 4;

  return { protein, fat, carbs, proteinKcal, fatKcal, carbsKcal };
}

/**
 * Sound chime synthesizer using Web Audio API
 */
function playAudioChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

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
 * Main Initialization
 */
async function init() {
  bindNavigationTabs();
  bindEvents();
  setupLifesumMealsEvents();
  setupBarcodeScannerEvents();
  setupStrongWorkoutEvents();

  el.mealsActiveDate.value = state.activeDate;
  el.workoutSessionDate.value = state.activeDate;

  await loadSettings();
  await loadEntries();
  await loadMealsForDate(state.activeDate);
  await loadPastWorkouts();
}

/**
 * Tab Navigation
 */
function bindNavigationTabs() {
  el.navTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-tab');
    if (!btn) return;
    const tabId = btn.dataset.tab;

    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    el.tabContents.forEach(tc => tc.classList.remove('active'));

    btn.classList.add('active');
    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.classList.add('active');

    // Trigger tab-specific refreshes
    if (tabId === 'tab-meals') {
      loadMealsForDate(state.activeDate);
    } else if (tabId === 'tab-workout') {
      loadPastWorkouts();
    } else if (tabId === 'tab-dashboard') {
      updateDashboard();
    }
  });
}

/**
 * Global Event Bindings
 */
function bindEvents() {
  // Day modal toggle
  el.btnOpenModal.addEventListener('click', () => openDayModal());
  el.btnCloseModal.addEventListener('click', () => closeDayModal());
  el.btnCancelModal.addEventListener('click', () => closeDayModal());
  el.entryModal.addEventListener('click', (e) => {
    if (e.target === el.entryModal) closeDayModal();
  });

  // Dropdown
  el.btnExport.addEventListener('click', (e) => {
    e.stopPropagation();
    el.exportMenu.classList.toggle('show');
  });
  window.addEventListener('click', () => {
    el.exportMenu.classList.remove('show');
  });

  // Import file
  el.importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      if (data.success) {
        alert('Tiedot tuotu onnistuneesti!');
        await loadEntries();
        await loadMealsForDate(state.activeDate);
      }
    } catch (err) {
      alert('Virhe tiedoston tuonnissa: ' + err.message);
    }
  });

  // Generate random data
  el.btnGenerateData.addEventListener('click', async () => {
    if (confirm('Generoidaanko 30 päivää realistista testidataa (ateriat, treenit, paino)? Tämä korvaa nykyisen datan.')) {
      try {
        const res = await fetch('/api/generate-random', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          await loadEntries();
          await loadMealsForDate(state.activeDate);
          await loadPastWorkouts();
          alert('30 päivää realistista testidataa luotu onnistuneesti!');
        }
      } catch (err) {
        alert('Virhe: ' + err.message);
      }
    }
  });

  // Reset
  el.btnResetData.addEventListener('click', async () => {
    if (confirm('Haluatko varmasti tyhjentää kaikki tiedot?')) {
      try {
        await fetch('/api/reset', { method: 'POST' });
        await loadEntries();
        await loadMealsForDate(state.activeDate);
        await loadPastWorkouts();
      } catch (err) {
        alert('Virhe: ' + err.message);
      }
    }
  });

  // Goal Selector
  el.goalSelector.addEventListener('click', async (e) => {
    const btn = e.target.closest('.goal-btn');
    if (!btn) return;
    state.settings.goal_mode = btn.dataset.goal;
    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    await saveSettings();
    updateAnalytics();
  });

  // Apply recommendation
  el.btnApplyRec.addEventListener('click', async () => {
    const recCal = parseInt(el.recCalVal.textContent, 10);
    if (recCal && !isNaN(recCal)) {
      state.settings.calorie_target = recCal;
      el.globalCalorieTarget.value = recCal;
      await saveSettings();
      updateDashboard();
      updateMealsOverview();
    }
  });

  // Target input
  el.btnSaveTarget.addEventListener('click', async () => {
    const newTarget = parseInt(el.globalCalorieTarget.value, 10);
    if (newTarget && newTarget >= 500 && newTarget <= 10000) {
      state.settings.calorie_target = newTarget;
      await saveSettings();
      updateDashboard();
      updateMealsOverview();
    }
  });

  // Real-time macro preview in form modal
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

/**
 * Backend Data Loaders
 */
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      state.settings = data.settings;
      el.globalCalorieTarget.value = state.settings.calorie_target;
      el.kpiTargetCals.textContent = state.settings.calorie_target;
      document.querySelectorAll('.goal-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.goal === state.settings.goal_mode);
      });
    }
  } catch (err) {
    console.error('Virhe asetusten haussa:', err);
  }
}

async function saveSettings() {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.settings)
    });
    el.kpiTargetCals.textContent = state.settings.calorie_target;
  } catch (err) {
    console.error('Virhe asetusten tallennuksessa:', err);
  }
}

async function loadEntries() {
  try {
    const res = await fetch('/api/entries');
    const data = await res.json();
    if (data.success) {
      state.entries = data.entries || [];
      updateDashboard();
    }
  } catch (err) {
    console.error('Virhe merkintöjen haussa:', err);
  }
}

/**
 * =========================================================================
 * LIFESUM-TYYLINEN ATERIA- JA RUOKAPÄIVÄKIRJA
 * =========================================================================
 */
function setupLifesumMealsEvents() {
  // Date navigation
  el.mealsActiveDate.addEventListener('change', () => {
    state.activeDate = el.mealsActiveDate.value;
    loadMealsForDate(state.activeDate);
  });

  el.btnPrevDay.addEventListener('click', () => {
    const d = new Date(state.activeDate);
    d.setDate(d.getDate() - 1);
    state.activeDate = d.toISOString().split('T')[0];
    el.mealsActiveDate.value = state.activeDate;
    loadMealsForDate(state.activeDate);
  });

  el.btnNextDay.addEventListener('click', () => {
    const d = new Date(state.activeDate);
    d.setDate(d.getDate() + 1);
    state.activeDate = d.toISOString().split('T')[0];
    el.mealsActiveDate.value = state.activeDate;
    loadMealsForDate(state.activeDate);
  });

  el.btnToday.addEventListener('click', () => {
    state.activeDate = new Date().toISOString().split('T')[0];
    el.mealsActiveDate.value = state.activeDate;
    loadMealsForDate(state.activeDate);
  });

  // "＋ Lisää" on individual meal cards
  document.querySelectorAll('.btn-add-to-meal').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentMealType = btn.dataset.meal;
      el.targetMealType.value = state.currentMealType;
      openFoodModal();
    });
  });

  el.btnOpenScanner.addEventListener('click', () => {
    openFoodModal('scanner');
  });

  el.btnQuickAddFood.addEventListener('click', () => {
    openFoodModal('search');
  });

  // Portion input live calculator
  el.mealPortionG.addEventListener('input', updatePortionCalculations);

  // Add calculated product to meal
  el.btnAddFoodToMeal.addEventListener('click', handleAddFoodToMeal);
}

async function loadMealsForDate(date) {
  try {
    const res = await fetch(`/api/meals?date=${date}`);
    const data = await res.json();
    if (data.success) {
      state.activeMealsData = data;
      renderMealsView(data);
    }
  } catch (err) {
    console.error('Virhe ateriatietojen haussa:', err);
  }
}

function renderMealsView(data) {
  const summary = data.summary;
  const targetCals = state.settings.calorie_target || 2400;

  // Find morning weight for this day if recorded, else latest weight
  const dayEntry = state.entries.find(e => e.date === data.date);
  const latestEntry = state.entries.length > 0 ? state.entries[state.entries.length - 1] : null;
  const currentWeight = dayEntry ? dayEntry.weight : (latestEntry ? latestEntry.weight : 78);

  const macroTargets = calculateRecommendedMacros(currentWeight, targetCals);

  // Remaining calories
  const eatenCals = summary.calories;
  const remainingCals = Math.max(0, targetCals - eatenCals);
  el.mealsRemainCals.textContent = remainingCals;
  el.mealsEatenCals.textContent = eatenCals;
  el.mealsTargetCals.textContent = targetCals;

  // Calorie SVG progress ring (circumference = 2 * PI * 70 = ~440)
  const ringPct = Math.min(1, eatenCals / targetCals);
  const ringOffset = 440 - (ringPct * 440);
  el.ringCalProgress.style.strokeDashoffset = ringOffset;
  el.ringCalProgress.style.stroke = eatenCals > targetCals + 200 ? '#f59e0b' : '#3b82f6';

  // Macros progress
  el.mealsPSummary.textContent = `${Math.round(summary.protein)} / ${macroTargets.protein} g`;
  el.mealsPBar.style.width = `${Math.min(100, Math.round((summary.protein / macroTargets.protein) * 100))}%`;

  el.mealsCSummary.textContent = `${Math.round(summary.carbs)} / ${macroTargets.carbs} g`;
  el.mealsCBar.style.width = `${Math.min(100, Math.round((summary.carbs / macroTargets.carbs) * 100))}%`;

  el.mealsFSummary.textContent = `${Math.round(summary.fat)} / ${macroTargets.fat} g`;
  el.mealsFBar.style.width = `${Math.min(100, Math.round((summary.fat / macroTargets.fat) * 100))}%`;

  // Render individual meal blocks
  renderMealCategory('breakfast', summary.by_meal.breakfast, el.listBreakfast, el.subBreakfast);
  renderMealCategory('lunch', summary.by_meal.lunch, el.listLunch, el.subLunch);
  renderMealCategory('dinner', summary.by_meal.dinner, el.listDinner, el.subDinner);
  renderMealCategory('snack', summary.by_meal.snack, el.listSnack, el.subSnack);
}

function renderMealCategory(mealType, items, listElem, subElem) {
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
        <span class="mil-name">${escapeHtml(item.food_name)} ${item.brand ? `<small style="color:#64748b">(${escapeHtml(item.brand)})</small>` : ''}</span>
        <span class="mil-meta">${item.portion_g} g • P: ${item.protein} g | H: ${item.carbs} g | R: ${item.fat} g</span>
      </div>
      <div class="meal-item-right">
        <span class="mil-cals">${Math.round(item.calories)} kcal</span>
        <button class="btn-del-item" onclick="window.deleteMealItem(${item.id})" title="Poista ruoka">✕</button>
      </div>
    `;
    listElem.appendChild(row);
  });

  subElem.textContent = `${Math.round(subCals)} kcal`;
}

window.deleteMealItem = async (id) => {
  try {
    const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await loadMealsForDate(state.activeDate);
      await loadEntries();
    }
  } catch (err) {
    alert('Virhe poistettaessa ruokaa: ' + err.message);
  }
};

/**
 * =========================================================================
 * VIIVAKOODI- & QR-SKANNERI SEKÄ OPEN FOOD FACTS -INTEGRAATIO
 * =========================================================================
 */
function setupBarcodeScannerEvents() {
  // Modal toggle & tabs
  el.btnCloseFoodModal.addEventListener('click', closeFoodModal);
  el.foodModal.addEventListener('click', (e) => {
    if (e.target === el.foodModal) closeFoodModal();
  });

  el.tabBtnScanner.addEventListener('click', () => switchFoodModalTab('scanner'));
  el.tabBtnSearch.addEventListener('click', () => switchFoodModalTab('search'));
  el.tabBtnManual.addEventListener('click', () => switchFoodModalTab('manual'));

  // Camera toggle & switch
  el.btnToggleCamera.addEventListener('click', toggleCamera);
  el.btnSwitchCamera.addEventListener('click', switchCameraFacing);

  // Manual barcode search button
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

  // Quick test chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      el.manualBarcodeInput.value = code;
      lookupBarcode(code);
    });
  });

  // Live text search in food memory
  el.foodSearchInput.addEventListener('input', debounce(async () => {
    const q = el.foodSearchInput.value.trim();
    searchFoodMemory(q);
  }, 250));

  // Manual product creation
  el.createFoodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('mf-name').value.trim(),
      brand: document.getElementById('mf-brand').value.trim(),
      barcode: document.getElementById('mf-barcode').value.trim() || null,
      calories_100g: parseFloat(document.getElementById('mf-cal').value),
      protein_100g: parseFloat(document.getElementById('mf-p').value || 0),
      carbs_100g: parseFloat(document.getElementById('mf-c').value || 0),
      fat_100g: parseFloat(document.getElementById('mf-f').value || 0)
    };

    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.food) {
        selectProductForPortion(data.food);
      }
    } catch (err) {
      alert('Virhe tuotteen tallennuksessa: ' + err.message);
    }
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

  if (tabName === 'scanner') {
    startCamera();
  } else {
    stopCamera();
  }

  if (tabName === 'search') {
    searchFoodMemory(el.foodSearchInput.value.trim());
  }
}

/**
 * Camera stream and barcode detection
 */
async function startCamera() {
  if (state.scannerStream) return;
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showScannerStatus('Kameratukea ei ole saatavilla tässä selaimessa. Voit syöttää koodin käsin alta.', 'error');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: state.cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    state.scannerStream = stream;
    el.scannerVideo.srcObject = stream;
    el.btnToggleCamera.textContent = 'Pysäytä kamera';
    showScannerStatus('Kamera aktiivinen. Osoita viivakoodia tai QR-koodia.', 'info');

    // Start detector loop if BarcodeDetector API exists
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a', 'upc_e']
      });

      state.scannerInterval = setInterval(async () => {
        if (!state.scannerStream || el.scannerVideo.readyState < 2) return;
        try {
          const barcodes = await barcodeDetector.detect(el.scannerVideo);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            stopCamera();
            el.manualBarcodeInput.value = code;
            lookupBarcode(code);
          }
        } catch (_) {}
      }, 500);
    }
  } catch (err) {
    showScannerStatus('Kameran käyttöoikeutta ei myönnetty tai laitetta ei löydy. Syötä koodi käsin alle.', 'error');
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
 * Barcode lookup: First SQLite local foods -> Then Open Food Facts API
 */
async function lookupBarcode(barcode) {
  showScannerStatus(`Haetaan koodilla ${barcode}...`, 'info');

  // 1. Check local DB
  try {
    const localRes = await fetch(`/api/foods?barcode=${encodeURIComponent(barcode)}`);
    const localData = await localRes.json();
    if (localData.success && localData.food) {
      showScannerStatus(`Löytyi paikallisesta tuotemuistista: ${localData.food.name}`, 'success');
      selectProductForPortion(localData.food);
      return;
    }
  } catch (_) {}

  // 2. Fetch from Open Food Facts API
  try {
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    const offRes = await fetch(offUrl);
    const offData = await offRes.json();

    if (offData.status === 1 && offData.product) {
      const prod = offData.product;
      const nutriments = prod.nutriments || {};

      const name = prod.product_name_fi || prod.product_name || 'Tuntematon tuote';
      const brand = prod.brands || '';
      const calories = nutriments['energy-kcal_100g'] !== undefined
        ? nutriments['energy-kcal_100g']
        : (nutriments.energy_100g ? Math.round(nutriments.energy_100g / 4.184) : 0);
      const protein = nutriments.proteins_100g || 0;
      const carbs = nutriments.carbohydrates_100g || 0;
      const fat = nutriments.fat_100g || 0;

      const foodObj = {
        barcode,
        name,
        brand,
        calories_100g: Math.round(calories * 10) / 10,
        protein_100g: Math.round(protein * 10) / 10,
        carbs_100g: Math.round(carbs * 10) / 10,
        fat_100g: Math.round(fat * 10) / 10,
        serving_size_g: 100
      };

      // Save to local product memory
      await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodObj)
      });

      showScannerStatus(`Löytyi Open Food Factsista: ${name}`, 'success');
      selectProductForPortion(foodObj);
      return;
    }
  } catch (err) {
    console.error('Open Food Facts API error:', err);
  }

  // Not found
  showScannerStatus(`Tuotetta ei löytynyt koodilla ${barcode}. Voit luoda sen käsin "Luo uusi tuote käsin" -välilehdeltä.`, 'error');
  document.getElementById('mf-barcode').value = barcode;
}

/**
 * Text search in local product database
 */
async function searchFoodMemory(query) {
  try {
    const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.success) {
      el.foodResultsList.innerHTML = '';
      if (data.foods.length === 0) {
        el.foodResultsList.innerHTML = `<div class="empty-meal-msg">Ei hakutuloksia tuotemuistista</div>`;
        return;
      }
      data.foods.forEach(f => {
        const item = document.createElement('div');
        item.className = 'food-result-item';
        item.innerHTML = `
          <div>
            <strong>${escapeHtml(f.name)}</strong> ${f.brand ? `<small style="color:#64748b">(${escapeHtml(f.brand)})</small>` : ''}<br>
            <small style="color:#94a3b8">${f.calories_100g} kcal / 100g • P: ${f.protein_100g}g | H: ${f.carbs_100g}g | R: ${f.fat_100g}g</small>
          </div>
          <button class="btn btn-small btn-secondary">Valitse</button>
        `;
        item.addEventListener('click', () => selectProductForPortion(f));
        el.foodResultsList.appendChild(item);
      });
    }
  } catch (err) {
    console.error('Search error:', err);
  }
}

/**
 * Select a product to calculate portion
 */
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

async function handleAddFoodToMeal() {
  if (!state.selectedFood) return;
  const portionG = parseFloat(el.mealPortionG.value) || 0;
  if (portionG <= 0) {
    alert('Anna kelvollinen annoskoko grammoina.');
    return;
  }

  const scale = portionG / 100;
  const mealType = el.targetMealType.value;
  const payload = {
    date: state.activeDate,
    meal_type: mealType,
    food_name: state.selectedFood.name,
    brand: state.selectedFood.brand || '',
    barcode: state.selectedFood.barcode || '',
    portion_g: portionG,
    calories: Math.round(state.selectedFood.calories_100g * scale),
    protein: Math.round(state.selectedFood.protein_100g * scale * 10) / 10,
    carbs: Math.round(state.selectedFood.carbs_100g * scale * 10) / 10,
    fat: Math.round(state.selectedFood.fat_100g * scale * 10) / 10
  };

  try {
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeFoodModal();
      await loadMealsForDate(state.activeDate);
      await loadEntries();
    }
  } catch (err) {
    alert('Virhe aterian lisäyksessä: ' + err.message);
  }
}

/**
 * =========================================================================
 * STRONG-TYYLINEN SALITREENILOGI JA LEPOTAUKOAJASTIN
 * =========================================================================
 */
function setupStrongWorkoutEvents() {
  // Start workout from template
  el.btnStartWorkout.addEventListener('click', () => {
    const templateName = el.workoutTemplateSelect.value || 'Oma salitreeni';
    startNewWorkoutSession(templateName);
  });

  // Cancel workout
  el.btnCancelWorkout.addEventListener('click', () => {
    if (confirm('Haluatko keskeyttää treenin tallentamatta?')) {
      el.activeWorkoutCard.style.display = 'none';
      state.activeWorkout = null;
    }
  });

  // Add exercise to active session
  el.btnAddExercise.addEventListener('click', () => {
    const name = prompt('Anna uuden liikkeen nimi (esim. Penkkipunnerrus tangolla):');
    if (name && name.trim()) {
      addExerciseBlockToSession(name.trim());
    }
  });

  // Finish and save workout
  el.btnFinishWorkout.addEventListener('click', handleFinishWorkout);

  // Rest Timer controls
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

function startNewWorkoutSession(name) {
  state.activeWorkout = {
    name,
    date: state.activeDate,
    exercises: []
  };

  el.workoutSessionName.value = name;
  el.workoutSessionDate.value = state.activeDate;
  el.exercisesContainer.innerHTML = '';
  el.activeWorkoutCard.style.display = 'flex';

  // Populate default exercises based on split
  let defaultExercises = ['Penkkipunnerrus tangolla', 'Pystypunnerrus', 'Ojentajapunnerrus taljassa'];
  if (name.includes('Pull')) defaultExercises = ['Maastaveto', 'Leuanveto', 'Hauiskääntö tangolla'];
  if (name.includes('Legs')) defaultExercises = ['Takakyykky tangolla', 'Jalkaprässi', 'Reiden koukistus laitteessa'];
  if (name.includes('Full Body')) defaultExercises = ['Takakyykky tangolla', 'Penkkipunnerrus tangolla', 'Leuanveto'];

  defaultExercises.forEach(exName => addExerciseBlockToSession(exName));
  el.activeWorkoutCard.scrollIntoView({ behavior: 'smooth' });
}

async function addExerciseBlockToSession(exerciseName) {
  const block = document.createElement('div');
  block.className = 'exercise-block';
  block.dataset.exercise = exerciseName;

  // Fetch previous performance from history
  let prevHistoryText = 'Ei aiempaa dataa';
  let prevSets = [];
  try {
    const res = await fetch(`/api/workouts/history/${encodeURIComponent(exerciseName)}`);
    const data = await res.json();
    if (data.success && data.history && data.history.sets) {
      prevSets = data.history.sets;
      prevHistoryText = `Edellinen (${data.history.date}): ${prevSets.map(s => `${s.weight_kg}kg×${s.reps}`).join(', ')}`;
    }
  } catch (_) {}

  block.innerHTML = `
    <div class="exercise-header">
      <div class="ex-title-wrap">
        <h4 class="ex-title">${escapeHtml(exerciseName)}</h4>
        <span class="ex-prev-hint">${prevHistoryText}</span>
      </div>
      <button type="button" class="btn btn-small btn-secondary btn-add-set">＋ Lisää sarja</button>
    </div>
    <table class="sets-table">
      <thead>
        <tr>
          <th style="width: 40px;">Sarja</th>
          <th style="width: 140px;">Edellinen</th>
          <th>kg</th>
          <th>Toistot</th>
          <th>RPE</th>
          <th style="width: 60px;">Valmis</th>
        </tr>
      </thead>
      <tbody class="sets-tbody">
      </tbody>
    </table>
  `;

  const tbody = block.querySelector('.sets-tbody');

  // Add 3 default sets with prefilled previous weights if known
  for (let i = 1; i <= 3; i++) {
    const prev = prevSets[i - 1];
    addSetRow(tbody, i, prev ? `${prev.weight_kg} kg × ${prev.reps}` : '-', prev ? prev.weight_kg : 60, prev ? prev.reps : 8);
  }

  block.querySelector('.btn-add-set').addEventListener('click', () => {
    const currentCount = tbody.querySelectorAll('tr').length;
    addSetRow(tbody, currentCount + 1, '-', 60, 8);
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
    <td>
      <button type="button" class="btn-check-set" title="Kuittaa sarja tehdyksi">✓</button>
    </td>
  `;

  const checkBtn = tr.querySelector('.btn-check-set');
  checkBtn.addEventListener('click', () => {
    checkBtn.classList.toggle('checked');
    if (checkBtn.classList.contains('checked')) {
      // Trigger rest timer automatically on set completion
      startRestTimer(90);
    }
  });

  tbody.appendChild(tr);
}

function startRestTimer(seconds = 90) {
  stopRestTimer();
  state.restTimer.totalSec = seconds;
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

async function handleFinishWorkout() {
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

      sets.push({
        exercise_name: exName,
        set_order: idx + 1,
        weight_kg: weight,
        reps,
        rpe,
        completed
      });
    });
  });

  const payload = {
    date,
    name,
    notes: `${exerciseBlocks.length} liikettä, ${sets.length} sarjaa.`,
    duration_min: 65,
    rating: 5,
    sets
  };

  try {
    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      el.activeWorkoutCard.style.display = 'none';
      stopRestTimer();
      await loadPastWorkouts();
      await loadEntries();
      alert('Treeni tallennettu onnistuneesti!');
    }
  } catch (err) {
    alert('Virhe treenin tallennuksessa: ' + err.message);
  }
}

async function loadPastWorkouts() {
  try {
    const res = await fetch('/api/workouts');
    const data = await res.json();
    if (data.success) {
      renderPastWorkouts(data.sessions || []);
    }
  } catch (err) {
    console.error('Past workouts load error:', err);
  }
}

function renderPastWorkouts(sessions) {
  el.workoutCountLabel.textContent = `${sessions.length} treeniä`;
  el.pastWorkoutsList.innerHTML = '';

  if (sessions.length === 0) {
    el.pastWorkoutsList.innerHTML = `<div class="empty-meal-msg">Ei vielä tallennettuja treenejä. Aloita uusi treeni yläpalkista!</div>`;
    return;
  }

  sessions.forEach(sess => {
    const card = document.createElement('div');
    card.className = 'past-workout-card';

    // Aggregate exercises and volume
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
        <button class="btn-del-item" onclick="window.deleteWorkoutSession(${sess.id})" title="Poista treeni">🗑️</button>
      </div>
      <div class="pwc-stats">
        <span>Sarjoja: <strong>${sess.sets.length}</strong></span>
        <span>Volyymi: <strong>${Math.round(totalVol)} kg</strong></span>
        <span>Kesto: <strong>${sess.duration_min} min</strong></span>
      </div>
      <div class="pwc-exercises-summary">
        ${exLines}
      </div>
    `;
    el.pastWorkoutsList.appendChild(card);
  });
}

window.deleteWorkoutSession = async (id) => {
  if (confirm('Haluatko poistaa tämän treenisession?')) {
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadPastWorkouts();
      }
    } catch (err) {
      alert('Virhe poistettaessa: ' + err.message);
    }
  }
};

/**
 * =========================================================================
 * DASHBOARD, KAAVIOT JA HISTORIATAULUKKO
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
    let calSum = 0;
    let weightSum = 0;
    let count = 0;
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
    el.kpiTodayDate.textContent = 'Ei dataa';
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
    svg.innerHTML = `<text x="400" y="160" fill="#64748b" text-anchor="middle" font-size="14">Ei tallennettuja painomerkintöjä</text>`;
    return;
  }
  const width = 800, height = 320, pad = { top: 30, right: 30, bottom: 40, left: 55 };
  const plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;

  let minW = Math.min(...entries.map(e => e.weight)), maxW = Math.max(...entries.map(e => e.weight));
  if (minW === maxW) { minW -= 2; maxW += 2; }
  const yPadding = (maxW - minW) * 0.15 || 1;
  const yMin = Math.floor((minW - yPadding) * 2) / 2;
  const yMax = Math.ceil((maxW + yPadding) * 2) / 2;

  const getX = (index) => pad.left + (entries.length === 1 ? plotW / 2 : (index / (entries.length - 1)) * plotW);
  const getY = (val) => pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  for (let i = 0; i <= 5; i++) {
    const val = yMin + (i / 5) * (yMax - yMin);
    const y = getY(val);
    svg.appendChild(createSvgElement('line', { x1: pad.left, y1: y, x2: width - pad.right, y2: y, stroke: '#232f48', 'stroke-width': 1, 'stroke-dasharray': i === 0 ? 'none' : '3,3' }));
    const label = createSvgElement('text', { x: pad.left - 10, y: y + 4, fill: '#64748b', 'font-size': 11, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' });
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
    svg.appendChild(createSvgElement('path', { d: maPathD, fill: 'none', stroke: '#f59e0b', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }

  let weightPathD = '';
  entries.forEach((e, i) => {
    const x = getX(i), y = getY(e.weight);
    weightPathD += (weightPathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
  });
  svg.appendChild(createSvgElement('path', { d: weightPathD, fill: 'none', stroke: '#38bdf8', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.85 }));

  entries.forEach((e, i) => {
    const x = getX(i), y = getY(e.weight);
    const circle = createSvgElement('circle', { cx: x, cy: y, r: entries.length > 35 ? 3 : 4.5, fill: '#38bdf8', stroke: '#0a0e17', 'stroke-width': 2 });
    svg.appendChild(circle);

    const hitArea = createSvgElement('circle', { cx: x, cy: y, r: 12, fill: 'transparent', style: 'cursor: pointer;' });
    hitArea.addEventListener('mouseenter', () => {
      circle.setAttribute('r', '7');
      circle.setAttribute('fill', '#ffffff');
      tooltip.innerHTML = `<strong>${formatDateFi(e.date)}</strong><br>Paino: <strong>${e.weight.toFixed(1)} kg</strong><br>7 pv ka: <strong>${e.ma7Weight ? e.ma7Weight.toFixed(1) + ' kg' : '-'}</strong>`;
      tooltip.style.opacity = '1';
      tooltip.style.left = `${Math.min(width - 150, Math.max(10, x - 50))}px`;
      tooltip.style.top = `${Math.max(10, y - 55)}px`;
    });
    hitArea.addEventListener('mouseleave', () => {
      circle.setAttribute('r', entries.length > 35 ? '3' : '4.5');
      circle.setAttribute('fill', '#38bdf8');
      tooltip.style.opacity = '0';
    });
    svg.appendChild(hitArea);

    const step = Math.ceil(entries.length / 8);
    if (i % step === 0 || i === entries.length - 1) {
      const text = createSvgElement('text', { x, y: height - 12, fill: '#64748b', 'font-size': 10, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
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
    svg.innerHTML = `<text x="400" y="160" fill="#64748b" text-anchor="middle" font-size="14">Ei tallennettuja kalorimerkintöjä</text>`;
    return;
  }
  const width = 800, height = 320, pad = { top: 30, right: 30, bottom: 40, left: 55 };
  const plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;
  const targetCals = state.settings.calorie_target || 2400;

  const calValues = entries.map(e => e.calories).concat([targetCals]);
  const minC = Math.min(...calValues), maxC = Math.max(...calValues);
  const yMin = Math.max(0, Math.floor((minC - 300) / 200) * 200);
  const yMax = Math.ceil((maxC + 300) / 200) * 200;
  const getY = (val) => pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  for (let i = 0; i <= 5; i++) {
    const val = Math.round(yMin + (i / 5) * (yMax - yMin));
    const y = getY(val);
    svg.appendChild(createSvgElement('line', { x1: pad.left, y1: y, x2: width - pad.right, y2: y, stroke: '#232f48', 'stroke-width': 1, 'stroke-dasharray': i === 0 ? 'none' : '3,3' }));
    const label = createSvgElement('text', { x: pad.left - 10, y: y + 4, fill: '#64748b', 'font-size': 11, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' });
    label.textContent = val;
    svg.appendChild(label);
  }

  // Target dashed line
  const targetY = getY(targetCals);
  svg.appendChild(createSvgElement('line', { x1: pad.left, y1: targetY, x2: width - pad.right, y2: targetY, stroke: '#ef4444', 'stroke-width': 2, 'stroke-dasharray': '5,5' }));

  const count = entries.length;
  const barSlotW = plotW / count;
  const barW = Math.max(4, Math.min(22, barSlotW * 0.65));

  entries.forEach((e, i) => {
    const barX = pad.left + i * barSlotW + (barSlotW - barW) / 2;
    const barY = getY(e.calories);
    const barHeight = Math.max(2, (pad.top + plotH) - barY);

    const rect = createSvgElement('rect', { x: barX, y: barY, width: barW, height: barHeight, fill: '#3b82f6', rx: 3, opacity: 0.85 });
    svg.appendChild(rect);

    const hitArea = createSvgElement('rect', { x: pad.left + i * barSlotW, y: pad.top, width: barSlotW, height: plotH, fill: 'transparent', style: 'cursor: pointer;' });
    hitArea.addEventListener('mouseenter', () => {
      rect.setAttribute('fill', '#60a5fa');
      const dDiff = e.calories - targetCals;
      const dSign = dDiff > 0 ? `+${dDiff}` : `${dDiff}`;
      tooltip.innerHTML = `<strong>${formatDateFi(e.date)}</strong><br>Kalorit: <strong>${e.calories} kcal</strong> (${dSign})<br>Tavoite: <strong>${targetCals} kcal</strong><br>7 pv ka: <strong>${e.ma7Calories || '-'} kcal</strong>`;
      tooltip.style.opacity = '1';
      tooltip.style.left = `${Math.min(width - 160, Math.max(10, barX - 60))}px`;
      tooltip.style.top = `${Math.max(10, barY - 60)}px`;
    });
    hitArea.addEventListener('mouseleave', () => {
      rect.setAttribute('fill', '#3b82f6');
      tooltip.style.opacity = '0';
    });
    svg.appendChild(hitArea);

    const step = Math.ceil(entries.length / 8);
    if (i % step === 0 || i === entries.length - 1) {
      const text = createSvgElement('text', { x: pad.left + i * barSlotW + barSlotW / 2, y: height - 12, fill: '#64748b', 'font-size': 10, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' });
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
    svg.appendChild(createSvgElement('path', { d: calMaPathD, fill: 'none', stroke: '#10b981', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
}

function renderTable(entries) {
  const tbody = el.entriesTbody;
  tbody.innerHTML = '';
  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #64748b; padding: 32px;">Ei merkintöjä.</td></tr>`;
    return;
  }

  entries.forEach(e => {
    const tr = document.createElement('tr');
    const workoutContent = e.workout
      ? `<span class="badge-tag badge-workout">🏋️ Kyllä</span> ${e.workout_notes ? `<br><small style="color:#94a3b8">${escapeHtml(e.workout_notes)}</small>` : ''}`
      : `<span class="badge-tag badge-rest">Lepopäivä</span>`;

    const recoveryContent = e.recovery
      ? `<span>${e.recovery}/5</span>`
      : `<span style="color:#64748b">-</span>`;

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
          <button class="btn-icon-action" onclick="window.editDayEntry(${e.id})" title="Muokkaa">✏️</button>
          <button class="btn-icon-action del" onclick="window.deleteDayEntry(${e.id})" title="Poista">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
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

async function handleDayFormSubmit(e) {
  e.preventDefault();
  const id = el.entryId.value;
  const payload = {
    date: el.formDate.value,
    weight: parseFloat(el.formWeight.value),
    calories: parseInt(el.formCalories.value, 10),
    protein: el.formProtein.value !== '' ? parseFloat(el.formProtein.value) : null,
    carbs: el.formCarbs.value !== '' ? parseFloat(el.formCarbs.value) : null,
    fat: el.formFat.value !== '' ? parseFloat(el.formFat.value) : null,
    workout: el.formWorkout.checked ? 1 : 0,
    workout_notes: el.formWorkoutNotes.value,
    workout_mood: el.formWorkoutMood.value ? parseInt(el.formWorkoutMood.value, 10) : null,
    recovery: el.formRecovery.value ? parseInt(el.formRecovery.value, 10) : null
  };

  try {
    const url = id ? `/api/entries/${id}` : '/api/entries';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeDayModal();
      await loadEntries();
    } else {
      alert('Virhe tallennuksessa: ' + data.error);
    }
  } catch (err) {
    alert('Verkkovirhe: ' + err.message);
  }
}

window.editDayEntry = (id) => openDayModal(id);
window.deleteDayEntry = async (id) => {
  if (confirm('Poistetaanko tämä merkintä?')) {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadEntries();
      }
    } catch (err) {
      alert('Virhe poistettaessa: ' + err.message);
    }
  }
};

/**
 * Utility Helpers
 */
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

// Start application
document.addEventListener('DOMContentLoaded', init);
