/**
 * Kalori- ja Makrovahti - Frontend Application Logic
 */

// State
const state = {
  entries: [],
  settings: {
    calorie_target: 2400,
    goal_mode: 'maintenance'
  },
  editingId: null
};

// DOM Elements
const el = {
  // Header & Modals
  btnOpenModal: document.getElementById('btn-open-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  entryModal: document.getElementById('entry-modal'),
  entryForm: document.getElementById('entry-form'),
  modalTitle: document.getElementById('modal-title'),
  btnGenerateData: document.getElementById('btn-generate-data'),
  btnExport: document.getElementById('btn-export'),
  exportMenu: document.getElementById('export-menu'),
  btnResetData: document.getElementById('btn-reset-data'),

  // KPI cards
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

  // Macro target settings & cards
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

  // Form Fields
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
  recoveryStars: document.getElementById('recovery-stars')
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

  const fat = Math.round(weightKg * 0.8 * 10) / 10;
  const fatRounded = Math.round(fat);
  const fatKcal = fatRounded * 9;

  const remainingKcal = (calorieTarget || 2400) - proteinKcal - fatKcal;
  const carbs = Math.max(0, Math.round(remainingKcal / 4));
  const carbsKcal = carbs * 4;

  return {
    protein,
    fat: fatRounded,
    carbs,
    proteinKcal,
    fatKcal,
    carbsKcal
  };
}

/**
 * Initialize application
 */
async function init() {
  bindEvents();
  await loadSettings();
  await loadEntries();
}

/**
 * Event bindings
 */
function bindEvents() {
  // Modal toggle
  el.btnOpenModal.addEventListener('click', () => openModal());
  el.btnCloseModal.addEventListener('click', () => closeModal());
  el.btnCancelModal.addEventListener('click', () => closeModal());
  el.entryModal.addEventListener('click', (e) => {
    if (e.target === el.entryModal) closeModal();
  });

  // Dropdown toggle
  el.btnExport.addEventListener('click', (e) => {
    e.stopPropagation();
    el.exportMenu.classList.toggle('show');
  });
  window.addEventListener('click', () => {
    el.exportMenu.classList.remove('show');
  });

  // Generate random data
  el.btnGenerateData.addEventListener('click', async () => {
    if (confirm('Generoidaanko 30 päivää realistista satunnaistesti-dataa? Tämä korvaa nykyisen datan.')) {
      try {
        const res = await fetch('/api/generate-random', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          await loadEntries();
        }
      } catch (err) {
        alert('Virhe datan luonnissa: ' + err.message);
      }
    }
  });

  // Reset data
  el.btnResetData.addEventListener('click', async () => {
    if (confirm('Haluatko varmasti tyhjentää kaikki tallennetut merkinnät?')) {
      try {
        await fetch('/api/reset', { method: 'POST' });
        await loadEntries();
      } catch (err) {
        alert('Virhe tyhjennyksessä: ' + err.message);
      }
    }
  });

  // Goal Selector
  el.goalSelector.addEventListener('click', async (e) => {
    const btn = e.target.closest('.goal-btn');
    if (!btn) return;
    const goal = btn.dataset.goal;
    state.settings.goal_mode = goal;

    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    await saveSettings();
    updateAnalytics();
  });

  // Apply recommendation button
  el.btnApplyRec.addEventListener('click', async () => {
    const recCal = parseInt(el.recCalVal.textContent, 10);
    if (recCal && !isNaN(recCal)) {
      state.settings.calorie_target = recCal;
      el.globalCalorieTarget.value = recCal;
      await saveSettings();
      updateDashboard();
    }
  });

  // Global target update button
  el.btnSaveTarget.addEventListener('click', async () => {
    const newTarget = parseInt(el.globalCalorieTarget.value, 10);
    if (newTarget && newTarget >= 500 && newTarget <= 10000) {
      state.settings.calorie_target = newTarget;
      await saveSettings();
      updateDashboard();
    } else {
      alert('Anna kelvollinen kaloritavoite (500-10000 kcal).');
    }
  });

  // Form input changes for real-time macro calculation
  const onFormWeightOrCalChange = () => {
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

  el.formWeight.addEventListener('input', onFormWeightOrCalChange);
  el.formCalories.addEventListener('input', onFormWeightOrCalChange);

  // Autofill macros button in form
  el.btnAutofillMacros.addEventListener('click', () => {
    const weight = parseFloat(el.formWeight.value);
    const cals = parseInt(el.formCalories.value, 10) || state.settings.calorie_target;
    if (!weight) {
      alert('Syötä ensin aamupaino (kg).');
      el.formWeight.focus();
      return;
    }
    const rec = calculateRecommendedMacros(weight, cals);
    el.formProtein.value = rec.protein;
    el.formFat.value = rec.fat;
    el.formCarbs.value = rec.carbs;
    updateFormMacroSum();
  });

  // Actual macros sum calculation
  const updateFormMacroSum = () => {
    const p = parseFloat(el.formProtein.value) || 0;
    const c = parseFloat(el.formCarbs.value) || 0;
    const f = parseFloat(el.formFat.value) || 0;
    const sum = Math.round(p * 4 + c * 4 + f * 9);
    el.macroSumKcal.textContent = sum;
  };

  el.formProtein.addEventListener('input', updateFormMacroSum);
  el.formCarbs.addEventListener('input', updateFormMacroSum);
  el.formFat.addEventListener('input', updateFormMacroSum);

  // Workout toggle
  el.formWorkout.addEventListener('change', () => {
    el.workoutDetailsWrap.style.display = el.formWorkout.checked ? 'flex' : 'none';
  });

  // Star ratings
  setupRatingButtons(el.workoutMoodStars, el.formWorkoutMood);
  setupRatingButtons(el.recoveryStars, el.formRecovery);

  // Form submit
  el.entryForm.addEventListener('submit', handleFormSubmit);
}

function setupRatingButtons(container, hiddenInput) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.rating-btn');
    if (!btn) return;
    const val = btn.dataset.val;
    if (hiddenInput.value === val) {
      // Toggle off
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
 * Load settings from backend
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

/**
 * Save settings to backend
 */
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

/**
 * Load entries from backend
 */
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
 * Main dashboard update logic
 */
function updateDashboard() {
  const entries = state.entries;
  el.entryCountLabel.textContent = `${entries.length} merkintää`;

  // Sort by date ascending for charts & time series calculations
  entries.sort((a, b) => a.date.localeCompare(b.date));

  // Compute 7-day moving averages
  computeMovingAverages(entries);

  // Update KPI cards
  updateKPIs(entries);

  // Update TDEE & Goal Analytics
  updateAnalytics();

  // Update Macro Section
  updateMacroSection(entries);

  // Render Charts
  renderWeightChart(entries);
  renderCaloriesChart(entries);

  // Render History Table (newest first)
  renderTable([...entries].reverse());
}

/**
 * Compute 7-day moving averages for each entry
 */
function computeMovingAverages(entries) {
  for (let i = 0; i < entries.length; i++) {
    // Collect window of up to 7 previous days
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

/**
 * Update Top KPI cards
 */
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

  // Daily calories
  el.kpiTodayDate.textContent = formatDateFi(latest.date);
  el.kpiTodayCals.textContent = latest.calories;
  const calDelta = latest.calories - targetCals;
  const deltaSign = calDelta > 0 ? `+${calDelta}` : `${calDelta}`;
  el.kpiTodayDelta.textContent = `(${deltaSign} kcal)`;
  el.kpiTodayDelta.className = 'kpi-delta ' + (calDelta > 200 ? 'delta-warn' : (calDelta < -400 ? 'delta-warn' : 'delta-good'));

  const pct = Math.min(100, Math.round((latest.calories / targetCals) * 100));
  el.kpiTodayProgress.style.width = `${pct}%`;

  // 7-day average calories
  const avg7dCals = latest.ma7Calories;
  el.kpi7dCals.textContent = avg7dCals;
  const avgDelta = avg7dCals - targetCals;
  const avgSign = avgDelta > 0 ? `+${avgDelta}` : `${avgDelta}`;
  el.kpi7dCalDelta.textContent = `${avgSign} kcal/pv`;
  el.kpi7dCalDelta.className = 'kpi-delta ' + (avgDelta > 150 ? 'delta-warn' : 'delta-good');
  el.kpi7dCalProgress.style.width = `${Math.min(100, Math.round((avg7dCals / targetCals) * 100))}%`;

  // Morning weight
  el.kpiCurrentWeight.textContent = latest.weight.toFixed(1);
  el.kpi7dWeight.textContent = latest.ma7Weight ? latest.ma7Weight.toFixed(1) : latest.weight.toFixed(1);

  // Weight trend badge
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

/**
 * Compute TDEE & Goal Analytics
 */
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
    el.recReasoningText.innerHTML = `Kerää vähintään 7 päivää aamupainoa ja kaloreita, jotta järjestelmä pystyy arvioimaan tarkan TDEE:n (todellisen kokonaiskulutuksesi). Nykyinen oletustavoite on <strong>${state.settings.calorie_target} kcal</strong>.`;
    return;
  }

  // Linear regression over last 14 to 30 days
  const windowEntries = entries.slice(-30);
  const N = windowEntries.length;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let totalCals = 0;

  for (let i = 0; i < N; i++) {
    sumX += i;
    sumY += windowEntries[i].weight;
    sumXY += i * windowEntries[i].weight;
    sumXX += i * i;
    totalCals += windowEntries[i].calories;
  }

  const slope = (N * sumXY - sumX * sumY) / (N * sumXX - sumX * sumX); // kg / day
  const weeklyWeightChange = slope * 7; // kg / week
  const avgCals = totalCals / N;

  // Energy balance: delta_kg * 7700 kcal
  const dailyCaloricBalance = slope * 7700; // e.g. -200 kcal/day if losing weight
  const estimatedTDEE = Math.round(avgCals - dailyCaloricBalance);

  el.kpiTdeeVal.textContent = estimatedTDEE;
  el.tdeeStatusBadge.textContent = 'Aktiivinen arvio';
  el.tdeeStatusBadge.className = 'kpi-badge success';
  el.kpiTdeeInfo.textContent = `Kulutus n. ${estimatedTDEE} kcal/pv (viimeiset ${N} pv)`;

  const weeklySign = weeklyWeightChange > 0 ? `+${weeklyWeightChange.toFixed(2)}` : weeklyWeightChange.toFixed(2);
  el.statWeightWeeklyRate.textContent = `${weeklySign} kg/vko`;

  const balanceSign = dailyCaloricBalance > 0 ? `+${Math.round(dailyCaloricBalance)}` : `${Math.round(dailyCaloricBalance)}`;
  el.statEnergyBalance.textContent = `${balanceSign} kcal/pv`;

  // Goal Mode recommendation
  let recommendedCals = estimatedTDEE;
  let reasoning = '';

  if (goalMode === 'fat_loss') {
    recommendedCals = Math.max(1500, Math.round(estimatedTDEE - 400));
    reasoning = `
      Valittu tavoite: <strong>Painon pudotus</strong>.<br>
      Arvioitu todellinen kulutuksesi on <strong>${estimatedTDEE} kcal/pv</strong>, ja painotrendisi on <strong>${weeklySign} kg/vko</strong> (toteutunut energiatase: <strong>${balanceSign} kcal/pv</strong>).<br>
      Suositeltu tavoite <strong>${recommendedCals} kcal/pv</strong> luo optimaalisen <strong>-400 kcal</strong> energiavajeen päivässä. Tämä vastaa noin 0,35–0,4 kg rasvanpolttonopeutta viikossa suojaten samalla lihasmassaa.
    `;
  } else if (goalMode === 'muscle_gain') {
    recommendedCals = Math.round(estimatedTDEE + 250);
    reasoning = `
      Valittu tavoite: <strong>Lihaskasvu (maltillinen plussa)</strong>.<br>
      Arvioitu todellinen kulutuksesi on <strong>${estimatedTDEE} kcal/pv</strong>.<br>
      Suositeltu tavoite <strong>${recommendedCals} kcal/pv</strong> antaa maltillisen <strong>+250 kcal/pv</strong> ylijäämän. Tämä tukee tehokasta lihasanaboliaa ja voimankehitystä minimoiden samalla rasvakertymän.
    `;
  } else {
    // Maintenance
    recommendedCals = estimatedTDEE;
    reasoning = `
      Valittu tavoite: <strong>Ylläpito / Recomposition</strong>.<br>
      Arvioitu todellinen kulutuksesi on <strong>${estimatedTDEE} kcal/pv</strong>.<br>
      Suositeltu tavoite <strong>${recommendedCals} kcal/pv</strong> pitää painon tasapainossa ja tukee kehonkoostumuksen parantamista (recomp) riittävällä proteiininsaannilla ja kovalla treenillä.
    `;
  }

  el.recCalVal.textContent = `${recommendedCals} kcal`;
  el.recReasoningText.innerHTML = reasoning;
}

/**
 * Update Macro Breakdown Section
 */
function updateMacroSection(entries) {
  const targetCals = state.settings.calorie_target || 2400;
  const latest = entries.length > 0 ? entries[entries.length - 1] : null;

  const currentWeight = latest ? latest.weight : 78;
  const rec = calculateRecommendedMacros(currentWeight, targetCals);

  // Targets
  el.macroTgtProtein.textContent = rec.protein;
  el.macroTgtProteinCal.textContent = `${rec.proteinKcal} kcal`;

  el.macroTgtFat.textContent = rec.fat;
  el.macroTgtFatCal.textContent = `${rec.fatKcal} kcal`;

  el.macroTgtCarbs.textContent = rec.carbs;
  el.macroTgtCarbsCal.textContent = `${rec.carbsKcal} kcal`;

  // Actuals from latest entry (if entered)
  const actP = latest && latest.protein !== null ? latest.protein : null;
  const actF = latest && latest.fat !== null ? latest.fat : null;
  const actC = latest && latest.carbs !== null ? latest.carbs : null;

  renderMacroCard(
    actP, rec.protein, 4,
    el.macroActProtein, el.macroActProteinCal, el.barProtein, el.pctProtein, el.diffProtein
  );

  renderMacroCard(
    actF, rec.fat, 9,
    el.macroActFat, el.macroActFatCal, el.barFat, el.pctFat, el.diffFat
  );

  renderMacroCard(
    actC, rec.carbs, 4,
    el.macroActCarbs, el.macroActCarbsCal, el.barCarbs, el.pctCarbs, el.diffCarbs
  );
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

/**
 * Render Interactive SVG Weight Chart
 */
function renderWeightChart(entries) {
  const svg = el.weightSvg;
  const tooltip = el.weightTooltip;
  svg.innerHTML = '';

  if (entries.length === 0) {
    svg.innerHTML = `<text x="400" y="160" fill="#64748b" text-anchor="middle" font-size="14">Ei tallennettuja painomerkintöjä</text>`;
    return;
  }

  const width = 800;
  const height = 320;
  const pad = { top: 30, right: 30, bottom: 40, left: 55 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  // Determine min and max weight
  let minW = Math.min(...entries.map(e => e.weight));
  let maxW = Math.max(...entries.map(e => e.weight));
  if (minW === maxW) {
    minW -= 2;
    maxW += 2;
  }
  const yPadding = (maxW - minW) * 0.15 || 1;
  const yMin = Math.floor((minW - yPadding) * 2) / 2;
  const yMax = Math.ceil((maxW + yPadding) * 2) / 2;

  const getX = (index) => pad.left + (entries.length === 1 ? plotW / 2 : (index / (entries.length - 1)) * plotW);
  const getY = (val) => pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  // Grid lines & Y-ticks
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const val = yMin + (i / ySteps) * (yMax - yMin);
    const y = getY(val);

    const line = createSvgElement('line', {
      x1: pad.left,
      y1: y,
      x2: width - pad.right,
      y2: y,
      stroke: '#232f48',
      'stroke-width': 1,
      'stroke-dasharray': i === 0 ? 'none' : '3,3'
    });
    svg.appendChild(line);

    const label = createSvgElement('text', {
      x: pad.left - 10,
      y: y + 4,
      fill: '#64748b',
      'font-size': 11,
      'text-anchor': 'end',
      'font-family': 'JetBrains Mono, monospace'
    });
    label.textContent = val.toFixed(1);
    svg.appendChild(label);
  }

  // Draw 7-day Moving Average Line (if available)
  let maPathD = '';
  entries.forEach((e, i) => {
    if (e.ma7Weight) {
      const x = getX(i);
      const y = getY(e.ma7Weight);
      maPathD += (maPathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }
  });

  if (maPathD) {
    const maPath = createSvgElement('path', {
      d: maPathD,
      fill: 'none',
      stroke: '#f59e0b',
      'stroke-width': 3,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    });
    svg.appendChild(maPath);
  }

  // Draw Daily Weight Line & Points
  let weightPathD = '';
  entries.forEach((e, i) => {
    const x = getX(i);
    const y = getY(e.weight);
    weightPathD += (weightPathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
  });

  const weightPath = createSvgElement('path', {
    d: weightPathD,
    fill: 'none',
    stroke: '#38bdf8',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: 0.85
  });
  svg.appendChild(weightPath);

  // Dots & Interactive Tooltips
  entries.forEach((e, i) => {
    const x = getX(i);
    const y = getY(e.weight);

    const circle = createSvgElement('circle', {
      cx: x,
      cy: y,
      r: entries.length > 35 ? 3 : 4.5,
      fill: '#38bdf8',
      stroke: '#0a0e17',
      'stroke-width': 2
    });
    svg.appendChild(circle);

    // Invisible larger hover target
    const hitArea = createSvgElement('circle', {
      cx: x,
      cy: y,
      r: 12,
      fill: 'transparent',
      style: 'cursor: pointer;'
    });

    hitArea.addEventListener('mouseenter', (evt) => {
      circle.setAttribute('r', '7');
      circle.setAttribute('fill', '#ffffff');

      tooltip.innerHTML = `
        <strong>${formatDateFi(e.date)}</strong><br>
        Paino: <strong>${e.weight.toFixed(1)} kg</strong><br>
        7 pv ka: <strong>${e.ma7Weight ? e.ma7Weight.toFixed(1) + ' kg' : '-'}</strong>
      `;
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

    // X-axis date labels (show every few days to avoid crowding)
    const step = Math.ceil(entries.length / 8);
    if (i % step === 0 || i === entries.length - 1) {
      const text = createSvgElement('text', {
        x: x,
        y: height - 12,
        fill: '#64748b',
        'font-size': 10,
        'text-anchor': 'middle',
        'font-family': 'JetBrains Mono, monospace'
      });
      text.textContent = e.date.substring(5); // MM-DD
      svg.appendChild(text);
    }
  });
}

/**
 * Render Interactive SVG Calories Chart
 */
function renderCaloriesChart(entries) {
  const svg = el.caloriesSvg;
  const tooltip = el.caloriesTooltip;
  svg.innerHTML = '';

  if (entries.length === 0) {
    svg.innerHTML = `<text x="400" y="160" fill="#64748b" text-anchor="middle" font-size="14">Ei tallennettuja kalorimerkintöjä</text>`;
    return;
  }

  const width = 800;
  const height = 320;
  const pad = { top: 30, right: 30, bottom: 40, left: 55 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const targetCals = state.settings.calorie_target || 2400;

  // Determine min and max calories
  const calValues = entries.map(e => e.calories).concat([targetCals]);
  const minC = Math.min(...calValues);
  const maxC = Math.max(...calValues);
  const yMin = Math.max(0, Math.floor((minC - 300) / 200) * 200);
  const yMax = Math.ceil((maxC + 300) / 200) * 200;

  const getY = (val) => pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  // Y-ticks
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const val = Math.round(yMin + (i / ySteps) * (yMax - yMin));
    const y = getY(val);

    const line = createSvgElement('line', {
      x1: pad.left,
      y1: y,
      x2: width - pad.right,
      y2: y,
      stroke: '#232f48',
      'stroke-width': 1,
      'stroke-dasharray': i === 0 ? 'none' : '3,3'
    });
    svg.appendChild(line);

    const label = createSvgElement('text', {
      x: pad.left - 10,
      y: y + 4,
      fill: '#64748b',
      'font-size': 11,
      'text-anchor': 'end',
      'font-family': 'JetBrains Mono, monospace'
    });
    label.textContent = val;
    svg.appendChild(label);
  }

  // Draw Target Calorie Line (Red dashed)
  const targetY = getY(targetCals);
  const targetLine = createSvgElement('line', {
    x1: pad.left,
    y1: targetY,
    x2: width - pad.right,
    y2: targetY,
    stroke: '#ef4444',
    'stroke-width': 2,
    'stroke-dasharray': '5,5'
  });
  svg.appendChild(targetLine);

  // Bars for daily calories
  const count = entries.length;
  const barSlotW = plotW / count;
  const barW = Math.max(4, Math.min(22, barSlotW * 0.65));

  entries.forEach((e, i) => {
    const barX = pad.left + i * barSlotW + (barSlotW - barW) / 2;
    const barY = getY(e.calories);
    const barHeight = Math.max(2, (pad.top + plotH) - barY);

    // Color based on calories relative to target
    const diff = e.calories - targetCals;
    let barColor = '#3b82f6'; // default primary
    if (diff > 350) barColor = '#f59e0b'; // noticeable surplus
    if (diff < -500) barColor = '#ec4899'; // deep deficit

    const rect = createSvgElement('rect', {
      x: barX,
      y: barY,
      width: barW,
      height: barHeight,
      fill: barColor,
      rx: 3,
      opacity: 0.85
    });
    svg.appendChild(rect);

    // Hitbox for tooltip
    const hitArea = createSvgElement('rect', {
      x: pad.left + i * barSlotW,
      y: pad.top,
      width: barSlotW,
      height: plotH,
      fill: 'transparent',
      style: 'cursor: pointer;'
    });

    hitArea.addEventListener('mouseenter', () => {
      rect.setAttribute('opacity', '1');
      rect.setAttribute('fill', '#60a5fa');

      const dDiff = e.calories - targetCals;
      const dSign = dDiff > 0 ? `+${dDiff}` : `${dDiff}`;
      tooltip.innerHTML = `
        <strong>${formatDateFi(e.date)}</strong><br>
        Kalorit: <strong>${e.calories} kcal</strong> (${dSign})<br>
        Tavoite: <strong>${targetCals} kcal</strong><br>
        7 pv ka: <strong>${e.ma7Calories || '-'} kcal</strong>
      `;
      tooltip.style.opacity = '1';
      tooltip.style.left = `${Math.min(width - 160, Math.max(10, barX - 60))}px`;
      tooltip.style.top = `${Math.max(10, barY - 60)}px`;
    });

    hitArea.addEventListener('mouseleave', () => {
      rect.setAttribute('opacity', '0.85');
      rect.setAttribute('fill', barColor);
      tooltip.style.opacity = '0';
    });

    svg.appendChild(hitArea);

    // X-axis date labels
    const step = Math.ceil(entries.length / 8);
    if (i % step === 0 || i === entries.length - 1) {
      const text = createSvgElement('text', {
        x: pad.left + i * barSlotW + barSlotW / 2,
        y: height - 12,
        fill: '#64748b',
        'font-size': 10,
        'text-anchor': 'middle',
        'font-family': 'JetBrains Mono, monospace'
      });
      text.textContent = e.date.substring(5);
      svg.appendChild(text);
    }
  });

  // 7-day Moving Average line for calories
  let calMaPathD = '';
  entries.forEach((e, i) => {
    if (e.ma7Calories) {
      const x = pad.left + i * barSlotW + barSlotW / 2;
      const y = getY(e.ma7Calories);
      calMaPathD += (calMaPathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }
  });

  if (calMaPathD) {
    const maPath = createSvgElement('path', {
      d: calMaPathD,
      fill: 'none',
      stroke: '#10b981',
      'stroke-width': 2.5,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    });
    svg.appendChild(maPath);
  }
}

/**
 * Render History Table
 */
function renderTable(entries) {
  const tbody = el.entriesTbody;
  tbody.innerHTML = '';

  if (entries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; color: #64748b; padding: 32px;">
          Ei vielä merkintöjä. Lisää ensimmäinen merkintä tai luo 30 pv testidataa napista!
        </td>
      </tr>
    `;
    return;
  }

  entries.forEach(e => {
    const tr = document.createElement('tr');

    const workoutContent = e.workout
      ? `<span class="badge-tag badge-workout">🏋️ Kyllä</span> ${e.workout_mood ? `<span>(Fiilis ${e.workout_mood}/5)</span>` : ''} ${e.workout_notes ? `<br><small style="color:#94a3b8">${escapeHtml(e.workout_notes)}</small>` : ''}`
      : `<span class="badge-tag badge-rest">Lepopäivä</span>`;

    const recoveryContent = e.recovery
      ? `<span>${e.recovery}/5 ${['', '😴', '🥱', '😌', '⚡', '🚀'][e.recovery] || ''}</span>`
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
          <button class="btn-icon-action" onclick="window.editEntry(${e.id})" title="Muokkaa">✏️</button>
          <button class="btn-icon-action del" onclick="window.deleteEntry(${e.id})" title="Poista">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Modal Handling
 */
function openModal(entryId = null) {
  state.editingId = entryId;

  if (entryId) {
    el.modalTitle.textContent = 'Muokkaa päiväkirjamerkintää';
    const entry = state.entries.find(e => e.id === entryId);
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

      // Trigger macro previews
      const rec = calculateRecommendedMacros(entry.weight, entry.calories);
      el.previewP.textContent = rec.protein;
      el.previewF.textContent = rec.fat;
      el.previewC.textContent = rec.carbs;
    }
  } else {
    el.modalTitle.textContent = 'Uusi päiväkirjamerkintä';
    el.entryForm.reset();
    el.entryId.value = '';
    // Default to today
    const today = new Date().toISOString().split('T')[0];
    el.formDate.value = today;
    el.formCalories.value = state.settings.calorie_target || 2400;

    // Prefill weight from latest entry if available
    if (state.entries.length > 0) {
      const latest = state.entries[state.entries.length - 1];
      el.formWeight.value = latest.weight;
      const rec = calculateRecommendedMacros(latest.weight, state.settings.calorie_target);
      el.previewP.textContent = rec.protein;
      el.previewF.textContent = rec.fat;
      el.previewC.textContent = rec.carbs;
    } else {
      el.formWeight.value = '';
      el.previewP.textContent = '-';
      el.previewF.textContent = '-';
      el.previewC.textContent = '-';
    }

    el.workoutDetailsWrap.style.display = 'none';
    setRatingActive(el.workoutMoodStars, el.formWorkoutMood, null);
    setRatingActive(el.recoveryStars, el.formRecovery, null);
  }

  // Update macro sum in modal
  const p = parseFloat(el.formProtein.value) || 0;
  const c = parseFloat(el.formCarbs.value) || 0;
  const f = parseFloat(el.formFat.value) || 0;
  el.macroSumKcal.textContent = Math.round(p * 4 + c * 4 + f * 9);

  el.entryModal.classList.add('open');
}

function closeModal() {
  el.entryModal.classList.remove('open');
  state.editingId = null;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
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
    let url = '/api/entries';
    let method = 'POST';

    if (id) {
      url = `/api/entries/${id}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      closeModal();
      await loadEntries();
    } else {
      alert('Virhe tallennuksessa: ' + (data.error || 'Tuntematon virhe'));
    }
  } catch (err) {
    alert('Verkkovirhe: ' + err.message);
  }
}

/**
 * Global edit & delete actions for table rows
 */
window.editEntry = (id) => {
  openModal(id);
};

window.deleteEntry = async (id) => {
  if (confirm('Haluatko varmasti poistaa tämän merkinnän?')) {
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
 * Helpers
 */
function createSvgElement(tag, attrs) {
  const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    elem.setAttribute(k, v);
  }
  return elem;
}

function formatDateFi(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Start app
document.addEventListener('DOMContentLoaded', init);
