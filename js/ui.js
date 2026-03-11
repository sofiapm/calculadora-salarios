// UI Controller - toda a interacao com o DOM

const $ = id => document.getElementById(id);
let currentContract = 'dependente';
let currentDirection = 'gross-to-net';
let currentView = 'detailed';
let currentLang = 'pt';
let hasResults = false;
let lastResult = null;
let lastResultType = null;
let travelMode = 'auto';
let travelEntries = [];

// --- Toggles ---

function initToggles() {
  setupToggle('contract-toggle', v => {
    currentContract = v;
    $('form-dependente').hidden = v !== 'dependente';
    $('form-independente').hidden = v !== 'independente';
    $('form-deslocacoes').hidden = v !== 'deslocacoes';
    // Show/hide salary-specific UI
    const isTrav = v === 'deslocacoes';
    $('direction-toggle').hidden = isTrav;
    $('btn-calculate').hidden = isTrav;
    $('view-toggle').hidden = isTrav;
    // Reset results panel visibility
    if (isTrav) {
      $('results-empty').hidden = true;
      $('view-detailed').hidden = true;
      $('view-simple').hidden = true;
      $('view-travel').hidden = travelEntries.length === 0;
      if (travelEntries.length === 0) $('results-empty').hidden = false;
      updateTravelRateInfo();
    } else {
      $('view-travel').hidden = true;
      if (!hasResults) {
        $('results-empty').hidden = false;
      } else {
        showView(currentView);
      }
    }
  });
  setupToggle('direction-toggle', v => {
    currentDirection = v;
    updateLabels();
  });
  setupToggle('view-toggle', v => {
    currentView = v;
    if (hasResults) showView(v);
  });
  setupToggle('lang-toggle', v => {
    currentLang = v;
    if (hasResults && lastResult) reRender();
  });
  setupToggle('travel-mode-toggle', v => {
    travelMode = v;
    $('travel-auto-section').hidden = v !== 'auto';
    $('travel-manual-section').hidden = v !== 'manual';
  });
}

function setupToggle(groupId, onChange) {
  const group = $(groupId);
  group.addEventListener('click', e => {
    const btn = e.target.closest('[data-value]');
    if (!btn || !btn.classList.contains('outline')) return;
    group.querySelectorAll('[data-value]').forEach(b => b.classList.add('outline'));
    btn.classList.remove('outline');
    onChange(btn.dataset.value);
  });
}

function updateLabels() {
  const isNet = currentDirection === 'net-to-gross';
  $('dep-salary-label').textContent = isNet
    ? 'Salario Liquido Desejado (\u20AC)' : 'Salario Base Mensal (\u20AC)';
  $('ind-income-label').textContent = isNet
    ? 'Rendimento Liquido Desejado (\u20AC)' : 'Faturacao Mensal (\u20AC)';
}

// --- Checkboxes ---

function initCheckboxes() {
  $('dep-irs-jovem').addEventListener('change', e => {
    $('dep-jovem-year-wrap').hidden = !e.target.checked;
  });
  $('ind-irs-jovem').addEventListener('change', e => {
    $('ind-jovem-year-wrap').hidden = !e.target.checked;
  });
}

// --- Input Collection ---

function collectDepInput() {
  return {
    grossMonthly: parseFloat($('dep-salary').value) || 0,
    familySituation: $('dep-family').value,
    dependents: parseInt($('dep-dependents').value) || 0,
    dependentsUnder3: parseInt($('dep-under3').value) || 0,
    mealPerDay: parseFloat($('dep-meal').value) || 0,
    mealType: $('dep-meal-type').value,
    workDays: parseInt($('dep-workdays').value) || 22,
    transportMonthly: parseFloat($('dep-transport').value) || 0,
    subsidyMode: parseInt($('dep-subsidy-mode').value),
    irsJovemYear: $('dep-irs-jovem').checked
      ? parseInt($('dep-jovem-year').value) : null,
  };
}

function collectIndInput() {
  return {
    grossMonthly: parseFloat($('ind-income').value) || 0,
    familySituation: $('ind-family').value,
    dependents: parseInt($('ind-dependents').value) || 0,
    dependentsUnder3: parseInt($('ind-under3').value) || 0,
    firstYearExempt: $('ind-first-year').checked,
    irsJovemYear: $('ind-irs-jovem').checked
      ? parseInt($('ind-jovem-year').value) : null,
  };
}

// --- Validation ---

function validate(input, type) {
  const errors = [];
  if (!input.grossMonthly || input.grossMonthly <= 0) {
    errors.push(type === 'dependente'
      ? 'Introduza um salario valido.' : 'Introduza um valor de faturacao valido.');
  }
  if (type === 'dependente' && input.dependentsUnder3 > input.dependents) {
    errors.push('Dependentes menores de 3 nao podem exceder o total.');
  }
  return errors;
}

function showErrors(errors) {
  $('errors').innerHTML = errors.length
    ? '<small class="error">' + errors.join('<br>') + '</small>'
    : '';
}

// --- View Toggle ---

function showView(view) {
  $('view-detailed').hidden = view !== 'detailed';
  $('view-simple').hidden = view !== 'simple';
}

// --- Render Helpers ---

function row(label, value, cls) {
  return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + label + '</td><td style="text-align:right;font-family:var(--pico-font-family-monospace)">' + value + '</td></tr>';
}

function sRow(label, value, cls) {
  return '<div class="simple-row ' + (cls || '') + '"><span>' + label + '</span><span>' + value + '</span></div>';
}

function badge(label, value) {
  return '<div class="badge"><small>' + label + '</small><strong>' + value + '</strong></div>';
}

// --- i18n labels ---

var L = {
  pt: {
    grossCard: 'Bruto Mensal', netCard: 'Liquido Mensal',
    gross: 'Salario bruto', ss11: 'Seguranca Social (11%)', irs: 'IRS',
    netBase: 'Liquido base', mealSub: 'Sub. Alimentacao', transportSub: 'Sub. Transporte',
    totalNetMonthly: 'Total Liquido Mensal',
    grossAnnual: 'Rendimento bruto', ssEmployee: 'SS anual (trabalhador)',
    irsAnnual: 'IRS anual', jovemDiscount: 'Desconto IRS Jovem',
    netAnnualBase: 'Liquido anual (base)', months: 'meses',
    totalNetAnnual: 'Total Liquido Anual',
    employerTitle: 'Custo Empresa', grossAnnualLabel: 'Salario bruto anual',
    ssEmployer: 'SS empresa (23,75%)', mealAnnual: 'Sub. Alimentacao anual',
    transportAnnual: 'Sub. Transporte anual',
    totalCostAnnual: 'Custo Total Anual', totalCostMonthly: 'Custo Total Mensal (media)',
    monthlyTitle: 'Decomposicao Mensal', annualTitle: 'Resumo Anual',
    ratesTitle: 'Taxas Efetivas', irsEffective: 'IRS Efetiva',
    card: 'Cartao', cash: 'Dinheiro',
    mealNote: 'Alimentacao', travelNote: 'Deslocacao', perDay: '/dia', national: 'nacional',
    // Independente
    invoicing: 'Faturacao mensal', invoicingAnnual: 'Faturacao anual (12 meses)',
    taxableIncome: 'Rendimento tributavel (75%)', ss: 'Seguranca Social',
    ssAnnual: 'SS anual', netMonthly: 'Liquido Mensal', netAnnual: 'Liquido Anual',
    grossAnnualSimple: 'Bruto Anual', netAnnualSimple: 'Liquido Anual',
  },
  en: {
    grossCard: 'Gross Monthly', netCard: 'Net Monthly',
    gross: 'Gross salary', ss11: 'Social Security (11%)', irs: 'Income Tax',
    netBase: 'Net base', mealSub: 'Meal Allowance', transportSub: 'Transport Allowance',
    totalNetMonthly: 'Total Net Monthly',
    grossAnnual: 'Gross income', ssEmployee: 'SS annual (employee)',
    irsAnnual: 'Income Tax annual', jovemDiscount: 'Youth Tax Discount',
    netAnnualBase: 'Net annual (base)', months: 'months',
    totalNetAnnual: 'Total Net Annual',
    employerTitle: 'Employer Cost', grossAnnualLabel: 'Gross annual salary',
    ssEmployer: 'SS employer (23.75%)', mealAnnual: 'Meal Allowance annual',
    transportAnnual: 'Transport Allowance annual',
    totalCostAnnual: 'Total Annual Cost', totalCostMonthly: 'Total Monthly Cost (avg)',
    monthlyTitle: 'Monthly Breakdown', annualTitle: 'Annual Summary',
    ratesTitle: 'Effective Rates', irsEffective: 'Income Tax Eff.',
    card: 'Card', cash: 'Cash',
    mealNote: 'Meal', travelNote: 'Travel', perDay: '/day', national: 'national',
    // Independente
    invoicing: 'Monthly invoicing', invoicingAnnual: 'Annual invoicing (12 months)',
    taxableIncome: 'Taxable income (75%)', ss: 'Social Security',
    ssAnnual: 'SS annual', netMonthly: 'Net Monthly', netAnnual: 'Net Annual',
    grossAnnualSimple: 'Gross Annual', netAnnualSimple: 'Net Annual',
  }
};

function t(key) { return L[currentLang][key] || L.pt[key] || key; }

// --- Re-render on lang change ---

function reRender() {
  if (!lastResult) return;
  if (lastResultType === 'dependente') {
    renderDepDetailed(lastResult);
    renderDepSimple(lastResult);
  } else {
    renderIndDetailed(lastResult);
    renderIndSimple(lastResult);
  }
}

// --- Render: Trabalho Dependente ---

function renderDepDetailed(r) {
  $('card-gross-label').textContent = t('grossCard');
  $('card-net-label').textContent = t('netCard');
  $('h-monthly').textContent = t('monthlyTitle');
  $('h-annual').textContent = t('annualTitle');
  $('h-employer').textContent = t('employerTitle');
  $('h-rates').textContent = t('ratesTitle');

  $('res-gross').textContent = fmt(r.grossMonthlyEff);
  $('res-net').textContent = fmt(r.totalNetMonthly);

  const mealLabel = r.mealType === 'card' ? t('card') : t('cash');
  let html = '';
  html += row(t('gross'), fmt(r.grossMonthlyEff));
  html += row(t('ss11'), '- ' + fmt(r.ssMonthly), 'deduction');
  html += row(t('irs'), '- ' + fmt(r.irsMonthly), 'deduction');
  html += row(t('netBase'), fmt(r.netMonthlyBase), 'subtotal');
  if (r.mealMonthlyClean > 0)
    html += row(t('mealSub') + ' (' + mealLabel + ')', '+ ' + fmt(r.mealMonthlyClean), 'addition');
  if (r.transportMonthly > 0)
    html += row(t('transportSub'), '+ ' + fmt(r.transportMonthly), 'addition');
  html += row('<strong>' + t('totalNetMonthly') + '</strong>', '<strong>' + fmt(r.totalNetMonthly) + '</strong>');
  $('tbl-monthly').innerHTML = html;

  html = '';
  html += row(t('grossAnnual') + ' (' + r.subsidyMode + ' ' + t('months') + ')', fmt(r.grossAnual));
  html += row(t('ssEmployee'), '- ' + fmt(r.ssAnualEmp), 'deduction');
  html += row(t('irsAnnual'), '- ' + fmt(r.irs), 'deduction');
  if (r.jovemDiscount > 0)
    html += row('&emsp;' + t('jovemDiscount'), '- ' + fmt(r.jovemDiscount));
  html += row(t('netAnnualBase'), fmt(r.netAnual), 'subtotal');
  if (r.mealAnnualClean > 0)
    html += row(t('mealSub') + ' (' + mealLabel + ', 11 ' + t('months') + ')', '+ ' + fmt(r.mealAnnualClean), 'addition');
  if (r.transportAnnual > 0)
    html += row(t('transportSub') + ' (11 ' + t('months') + ')', '+ ' + fmt(r.transportAnnual), 'addition');
  html += row('<strong>' + t('totalNetAnnual') + '</strong>', '<strong>' + fmt(r.totalNetAnual) + '</strong>');
  $('tbl-annual').innerHTML = html;

  $('employer-section').hidden = false;
  html = '';
  html += row(t('grossAnnualLabel'), fmt(r.grossAnual));
  html += row(t('ssEmployer'), '+ ' + fmt(r.ssAnualEntidade), 'addition');
  if (r.mealAnnualTotal > 0)
    html += row(t('mealAnnual'), '+ ' + fmt(r.mealAnnualTotal), 'addition');
  if (r.transportAnnual > 0)
    html += row(t('transportAnnual'), '+ ' + fmt(r.transportAnnual), 'addition');
  html += row('<strong>' + t('totalCostAnnual') + '</strong>', '<strong>' + fmt(r.empCostAnual) + '</strong>');
  html += row(t('totalCostMonthly'), fmt(r.empCostMonthly));
  $('tbl-employer').innerHTML = html;

  $('rate-badges').innerHTML =
    badge('SS', fmtPct(r.rSS)) +
    badge(t('irsEffective'), fmtPct(r.rIRS)) +
    badge('Total', fmtPct(r.rTotal));

  $('warnings').innerHTML = r.warnings.map(w =>
    '<small class="warning">' + w + '</small>').join('');

  // Daily notes
  var notesHtml = buildDailyNotes(r, mealLabel);
  $('daily-notes').innerHTML = notesHtml;
}

// --- Render: Trabalho Independente ---

function renderIndDetailed(r) {
  $('card-gross-label').textContent = t('grossCard');
  $('card-net-label').textContent = t('netCard');
  $('h-monthly').textContent = t('monthlyTitle');
  $('h-annual').textContent = t('annualTitle');
  $('h-rates').textContent = t('ratesTitle');

  $('res-gross').textContent = fmt(r.grossMonthly);
  $('res-net').textContent = fmt(r.netMonthly);

  let html = '';
  html += row(t('invoicing'), fmt(r.grossMonthly));
  html += row(t('ss'), '- ' + fmt(r.ssMonthly), 'deduction');
  html += row(t('irs'), '- ' + fmt(r.irsMonthly), 'deduction');
  html += row('<strong>' + t('netMonthly') + '</strong>', '<strong>' + fmt(r.netMonthly) + '</strong>');
  $('tbl-monthly').innerHTML = html;

  html = '';
  html += row(t('invoicingAnnual'), fmt(r.grossAnual));
  html += row(t('taxableIncome'), fmt(r.rendTributavel));
  html += row(t('ssAnnual'), '- ' + fmt(r.ssAnual), 'deduction');
  html += row(t('irsAnnual'), '- ' + fmt(r.irs), 'deduction');
  if (r.jovemDiscount > 0)
    html += row('&emsp;' + t('jovemDiscount'), '- ' + fmt(r.jovemDiscount));
  html += row('<strong>' + t('netAnnual') + '</strong>', '<strong>' + fmt(r.netAnual) + '</strong>');
  $('tbl-annual').innerHTML = html;

  $('employer-section').hidden = true;

  $('rate-badges').innerHTML =
    badge('SS', fmtPct(r.rSS)) +
    badge(t('irsEffective'), fmtPct(r.rIRS)) +
    badge('Total', fmtPct(r.rTotal));

  $('warnings').innerHTML = '';
  $('daily-notes').innerHTML = '';
}

// --- Render: Vista Simples ---

function renderDepSimple(r) {
  const mealLabel = r.mealType === 'card' ? t('card') : t('cash');
  let html = '';
  html += sRow(t('gross'), fmt(r.grossMonthlyEff), 'gross-row');
  html += '<hr>';
  html += sRow(t('ss11'), '- ' + fmt(r.ssMonthly), 'deduction');
  html += sRow(t('irs'), '- ' + fmt(r.irsMonthly), 'deduction');
  html += '<hr>';
  html += sRow(t('netBase'), fmt(r.netMonthlyBase), '');
  if (r.mealMonthlyClean > 0)
    html += sRow(t('mealSub') + ' (' + mealLabel + ')', '+ ' + fmt(r.mealMonthlyClean), 'addition');
  if (r.transportMonthly > 0)
    html += sRow(t('transportSub'), '+ ' + fmt(r.transportMonthly), 'addition');
  html += '<hr>';
  html += sRow(t('totalNetMonthly'), fmt(r.totalNetMonthly), 'grand-total');
  html += '<hr>';
  html += sRow(t('grossAnnualSimple'), fmt(r.grossAnual), 'gross-row');
  html += sRow(t('netAnnualSimple'), fmt(r.totalNetAnual), 'grand-total');
  $('simple-content').innerHTML = html;
  $('daily-notes-simple').innerHTML = buildDailyNotes(r, mealLabel);
}

function renderIndSimple(r) {
  let html = '';
  html += sRow(t('invoicing'), fmt(r.grossMonthly), 'gross-row');
  html += '<hr>';
  html += sRow(t('ss'), '- ' + fmt(r.ssMonthly), 'deduction');
  html += sRow(t('irs'), '- ' + fmt(r.irsMonthly), 'deduction');
  html += '<hr>';
  html += sRow(t('netMonthly'), fmt(r.netMonthly), 'grand-total');
  html += '<hr>';
  html += sRow(t('grossAnnualSimple'), fmt(r.grossAnual), 'gross-row');
  html += sRow(t('netAnnualSimple'), fmt(r.netAnual), 'grand-total');
  $('simple-content').innerHTML = html;
  $('daily-notes-simple').innerHTML = '';
}

// --- Daily notes helper ---

function buildDailyNotes(r, mealLabel) {
  const travelRate = getDailyRate('workers', 'national');
  let notes = '<small class="travel-info">';
  if (r.mealPerDay > 0)
    notes += t('mealNote') + ': ' + fmt(r.mealPerDay) + t('perDay') + ' (' + mealLabel + ')';
  notes += ' &middot; ' + t('travelNote') + ': ' + fmt(travelRate) + t('perDay') + ' (' + t('national') + ')';
  notes += '</small>';
  return notes;
}

// --- Travel Helpers ---

function getTravelConfig() {
  return {
    month: parseInt($('travel-month').value),
    year: parseInt($('travel-year').value),
    workerType: $('travel-worker-type').value,
    location: $('travel-location').value,
  };
}

function updateTravelRateInfo() {
  const cfg = getTravelConfig();
  const rate = getDailyRate(cfg.workerType, cfg.location);
  const loc = cfg.location === 'national' ? 'Nacional' : 'Internacional';
  const type = cfg.workerType === 'workers' ? 'Trabalhadores' : 'Administradores';
  $('travel-rate-info').textContent = loc + ' / ' + type + ': ' + fmt(rate) + '/dia | 25% = ' +
    fmt(Math.round(rate * 0.25 * 100) / 100) + ' | 50% = ' + fmt(Math.round(rate * 0.50 * 100) / 100);
}

function renderTravelTable() {
  const cfg = getTravelConfig();
  const tbody = $('travel-entries-body');
  let html = '';

  travelEntries.forEach((e, i) => {
    const val = calcDayValue(e, cfg.workerType, cfg.location);
    html += '<tr data-idx="' + i + '">' +
      '<td><input type="text" inputmode="numeric" class="te-from" value="' + e.dayFrom + '"></td>' +
      '<td><input type="text" inputmode="numeric" class="te-to" value="' + e.dayTo + '"></td>' +
      '<td><input type="text" class="te-desc" value="' + escHtml(e.description) + '"></td>' +
      '<td><input type="text" inputmode="numeric" class="te-dep" placeholder="HH:MM" value="' + e.departure + '"></td>' +
      '<td><input type="text" inputmode="numeric" class="te-arr" placeholder="HH:MM" value="' + e.arrival + '"></td>' +
      '<td><input type="checkbox" class="te-lunch"' + (e.lunch ? ' checked' : '') + (e.fullDay ? ' disabled' : '') + '></td>' +
      '<td><input type="checkbox" class="te-dinner"' + (e.dinner ? ' checked' : '') + (e.fullDay ? ' disabled' : '') + '></td>' +
      '<td><input type="checkbox" class="te-acc"' + (e.accommodation ? ' checked' : '') + (e.fullDay ? ' disabled' : '') + '></td>' +
      '<td><input type="checkbox" class="te-full"' + (e.fullDay ? ' checked' : '') + '></td>' +
      '<td class="row-total">' + fmt(val) + '</td>' +
      '<td><button class="btn-remove" title="Remover">&times;</button></td>' +
      '</tr>';
  });

  tbody.innerHTML = html;

  const total = calcTotal(travelEntries, cfg.workerType, cfg.location);
  $('travel-total-value').textContent = fmt(total);

  $('view-travel').hidden = travelEntries.length === 0;
  $('results-empty').hidden = travelEntries.length > 0;
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function syncEntryFromRow(tr, idx) {
  const e = travelEntries[idx];
  if (!e) return;
  e.dayFrom = parseInt(tr.querySelector('.te-from').value) || 1;
  e.dayTo = parseInt(tr.querySelector('.te-to').value) || e.dayFrom;
  if (e.dayTo < e.dayFrom) e.dayTo = e.dayFrom;
  e.description = tr.querySelector('.te-desc').value;
  e.departure = tr.querySelector('.te-dep').value;
  e.arrival = tr.querySelector('.te-arr').value;
  e.fullDay = tr.querySelector('.te-full').checked;
  if (e.fullDay) {
    e.lunch = true; e.dinner = true; e.accommodation = true;
  } else {
    e.lunch = tr.querySelector('.te-lunch').checked;
    e.dinner = tr.querySelector('.te-dinner').checked;
    e.accommodation = tr.querySelector('.te-acc').checked;
  }
}

function addTravelRow() {
  const cfg = getTravelConfig();
  const workDays = getWorkingDays(cfg.month, cfg.year);
  const usedDays = new Set();
  travelEntries.forEach(e => {
    for (let d = e.dayFrom; d <= e.dayTo; d++) usedDays.add(d);
  });
  const nextDay = workDays.find(d => !usedDays.has(d)) || (travelEntries.length > 0 ? travelEntries[travelEntries.length - 1].dayTo + 1 : 1);
  travelEntries.push({
    dayFrom: nextDay,
    dayTo: nextDay,
    description: TRAVEL.DEFAULT_DESCRIPTIONS[travelEntries.length % TRAVEL.DEFAULT_DESCRIPTIONS.length],
    departure: '09:00',
    arrival: '18:00',
    fullDay: true,
    lunch: true,
    dinner: true,
    accommodation: true,
  });
  renderTravelTable();
}

function handleGenerate() {
  const cfg = getTravelConfig();
  const target = parseFloat($('travel-target').value) || 0;
  if (target <= 0) {
    $('travel-warning').innerHTML = '<small class="error">Introduza um valor total valido.</small>';
    return;
  }
  const result = generateEntries(target, cfg.month, cfg.year, cfg.workerType, cfg.location);
  travelEntries = result.entries;
  $('travel-warning').innerHTML = result.warning
    ? '<small class="warning">' + result.warning + '</small>' : '';
  renderTravelTable();
}

function handleExport() {
  if (travelEntries.length === 0) return;
  const cfg = getTravelConfig();
  exportToExcel(travelEntries, cfg.workerType, cfg.location, cfg.month, cfg.year);
}

function initTravelEvents() {
  $('btn-generate').addEventListener('click', handleGenerate);
  $('btn-add-row').addEventListener('click', addTravelRow);
  $('btn-add-row-bottom').addEventListener('click', addTravelRow);
  $('btn-export').addEventListener('click', handleExport);

  // Recalc on config change
  ['travel-worker-type', 'travel-location', 'travel-month', 'travel-year'].forEach(id => {
    $(id).addEventListener('change', () => {
      updateTravelRateInfo();
      if (travelEntries.length > 0) renderTravelTable();
    });
  });

  // Event delegation on entries table
  $('travel-entries-body').addEventListener('input', e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const idx = parseInt(tr.dataset.idx);
    syncEntryFromRow(tr, idx);
    renderTravelTable();
  });
  $('travel-entries-body').addEventListener('change', e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const idx = parseInt(tr.dataset.idx);
    syncEntryFromRow(tr, idx);
    renderTravelTable();
  });
  $('travel-entries-body').addEventListener('click', e => {
    if (!e.target.classList.contains('btn-remove')) return;
    const tr = e.target.closest('tr');
    const idx = parseInt(tr.dataset.idx);
    travelEntries.splice(idx, 1);
    renderTravelTable();
  });

  // Enter on target input triggers generate
  $('travel-target').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleGenerate();
  });

  // Set default month to current
  const now = new Date();
  $('travel-month').value = now.getMonth() + 1;
}

// --- Main Handler ---

function handleCalculate() {
  if (currentContract === 'deslocacoes') return;
  $('errors').innerHTML = '';
  let input, errors, result;

  if (currentContract === 'dependente') {
    input = collectDepInput();
    errors = validate(input, 'dependente');
    if (errors.length) { showErrors(errors); return; }

    if (currentDirection === 'net-to-gross') {
      const targetNet = input.grossMonthly;
      input.grossMonthly = 0;
      const gross = findGross(targetNet, calcDependente, input, 'totalNetMonthly');
      input.grossMonthly = gross;
    }

    result = calcDependente(input);
    lastResult = result; lastResultType = 'dependente';
    renderDepDetailed(result);
    renderDepSimple(result);
  } else {
    input = collectIndInput();
    errors = validate(input, 'independente');
    if (errors.length) { showErrors(errors); return; }

    if (currentDirection === 'net-to-gross') {
      const targetNet = input.grossMonthly;
      input.grossMonthly = 0;
      const gross = findGross(targetNet, calcIndependente, input, 'netMonthly');
      input.grossMonthly = gross;
    }

    result = calcIndependente(input);
    lastResult = result; lastResultType = 'independente';
    renderIndDetailed(result);
    renderIndSimple(result);
  }

  hasResults = true;
  $('results-empty').hidden = true;
  showView(currentView);
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
  initToggles();
  initCheckboxes();
  initTravelEvents();
  $('btn-calculate').addEventListener('click', handleCalculate);

  document.querySelectorAll('input[type="number"]').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleCalculate();
    });
  });
});
