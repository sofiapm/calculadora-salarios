// UI Controller - toda a interacao com o DOM

const $ = id => document.getElementById(id);
let currentContract = 'dependente';
let currentDirection = 'gross-to-net';
let currentView = 'detailed';
let hasResults = false;

// --- Toggles ---

function initToggles() {
  setupToggle('contract-toggle', v => {
    currentContract = v;
    $('form-dependente').hidden = v !== 'dependente';
    $('form-independente').hidden = v !== 'independente';
  });
  setupToggle('direction-toggle', v => {
    currentDirection = v;
    updateLabels();
  });
  setupToggle('view-toggle', v => {
    currentView = v;
    if (hasResults) showView(v);
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

// --- Render: Trabalho Dependente ---

function renderDepDetailed(r) {
  $('res-gross').textContent = fmt(r.grossMonthlyEff);
  $('res-net').textContent = fmt(r.totalNetMonthly);

  let html = '';
  html += row('Salario bruto', fmt(r.grossMonthlyEff));
  html += row('Seguranca Social (11%)', '- ' + fmt(r.ssMonthly), 'deduction');
  html += row('IRS', '- ' + fmt(r.irsMonthly), 'deduction');
  html += row('Liquido base', fmt(r.netMonthlyBase), 'subtotal');
  if (r.mealMonthlyClean > 0)
    html += row('Sub. Alimentacao (isento)', '+ ' + fmt(r.mealMonthlyClean), 'addition');
  if (r.transportMonthly > 0)
    html += row('Sub. Transporte', '+ ' + fmt(r.transportMonthly), 'addition');
  html += row('<strong>Total Liquido Mensal</strong>', '<strong>' + fmt(r.totalNetMonthly) + '</strong>');
  $('tbl-monthly').innerHTML = html;

  html = '';
  html += row('Rendimento bruto (' + r.subsidyMode + ' meses)', fmt(r.grossAnual));
  html += row('SS anual (trabalhador)', '- ' + fmt(r.ssAnualEmp), 'deduction');
  html += row('IRS anual', '- ' + fmt(r.irs), 'deduction');
  if (r.jovemDiscount > 0)
    html += row('&emsp;Desconto IRS Jovem', '- ' + fmt(r.jovemDiscount));
  html += row('Liquido anual (base)', fmt(r.netAnual), 'subtotal');
  if (r.mealAnnualClean > 0)
    html += row('Sub. Alimentacao (11 meses)', '+ ' + fmt(r.mealAnnualClean), 'addition');
  if (r.transportAnnual > 0)
    html += row('Sub. Transporte (11 meses)', '+ ' + fmt(r.transportAnnual), 'addition');
  html += row('<strong>Total Liquido Anual</strong>', '<strong>' + fmt(r.totalNetAnual) + '</strong>');
  $('tbl-annual').innerHTML = html;

  $('employer-section').hidden = false;
  html = '';
  html += row('Salario bruto anual', fmt(r.grossAnual));
  html += row('SS empresa (23,75%)', '+ ' + fmt(r.ssAnualEntidade), 'addition');
  if (r.mealAnnualTotal > 0)
    html += row('Sub. Alimentacao anual', '+ ' + fmt(r.mealAnnualTotal), 'addition');
  if (r.transportAnnual > 0)
    html += row('Sub. Transporte anual', '+ ' + fmt(r.transportAnnual), 'addition');
  html += row('<strong>Custo Total Anual</strong>', '<strong>' + fmt(r.empCostAnual) + '</strong>');
  html += row('Custo Total Mensal (media)', fmt(r.empCostMonthly));
  $('tbl-employer').innerHTML = html;

  $('rate-badges').innerHTML =
    badge('SS', fmtPct(r.rSS)) +
    badge('IRS Efetiva', fmtPct(r.rIRS)) +
    badge('Total', fmtPct(r.rTotal));

  $('warnings').innerHTML = r.warnings.map(w =>
    '<small class="warning">' + w + '</small>').join('');
}

// --- Render: Trabalho Independente ---

function renderIndDetailed(r) {
  $('res-gross').textContent = fmt(r.grossMonthly);
  $('res-net').textContent = fmt(r.netMonthly);

  let html = '';
  html += row('Faturacao mensal', fmt(r.grossMonthly));
  html += row('Seguranca Social', '- ' + fmt(r.ssMonthly), 'deduction');
  html += row('IRS', '- ' + fmt(r.irsMonthly), 'deduction');
  html += row('<strong>Liquido Mensal</strong>', '<strong>' + fmt(r.netMonthly) + '</strong>');
  $('tbl-monthly').innerHTML = html;

  html = '';
  html += row('Faturacao anual (12 meses)', fmt(r.grossAnual));
  html += row('Rendimento tributavel (75%)', fmt(r.rendTributavel));
  html += row('SS anual', '- ' + fmt(r.ssAnual), 'deduction');
  html += row('IRS anual', '- ' + fmt(r.irs), 'deduction');
  if (r.jovemDiscount > 0)
    html += row('&emsp;Desconto IRS Jovem', '- ' + fmt(r.jovemDiscount));
  html += row('<strong>Liquido Anual</strong>', '<strong>' + fmt(r.netAnual) + '</strong>');
  $('tbl-annual').innerHTML = html;

  $('employer-section').hidden = true;

  $('rate-badges').innerHTML =
    badge('SS', fmtPct(r.rSS)) +
    badge('IRS Efetiva', fmtPct(r.rIRS)) +
    badge('Total', fmtPct(r.rTotal));

  $('warnings').innerHTML = '';
}

// --- Render: Vista Simples ---

function renderDepSimple(r) {
  let html = '';
  html += sRow('Salario Bruto', fmt(r.grossMonthlyEff), 'gross-row');
  html += '<hr>';
  html += sRow('Seguranca Social (11%)', '- ' + fmt(r.ssMonthly), 'deduction');
  html += sRow('IRS', '- ' + fmt(r.irsMonthly), 'deduction');
  html += '<hr>';
  html += sRow('Liquido Base', fmt(r.netMonthlyBase), '');
  if (r.mealMonthlyClean > 0)
    html += sRow('Sub. Alimentacao', '+ ' + fmt(r.mealMonthlyClean), 'addition');
  if (r.transportMonthly > 0)
    html += sRow('Sub. Transporte', '+ ' + fmt(r.transportMonthly), 'addition');
  html += '<hr>';
  html += sRow('Total Liquido Mensal', fmt(r.totalNetMonthly), 'grand-total');
  $('simple-content').innerHTML = html;
}

function renderIndSimple(r) {
  let html = '';
  html += sRow('Faturacao Mensal', fmt(r.grossMonthly), 'gross-row');
  html += '<hr>';
  html += sRow('Seguranca Social', '- ' + fmt(r.ssMonthly), 'deduction');
  html += sRow('IRS', '- ' + fmt(r.irsMonthly), 'deduction');
  html += '<hr>';
  html += sRow('Liquido Mensal', fmt(r.netMonthly), 'grand-total');
  $('simple-content').innerHTML = html;
}

// --- Main Handler ---

function handleCalculate() {
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
  $('btn-calculate').addEventListener('click', handleCalculate);

  document.querySelectorAll('input[type="number"]').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleCalculate();
    });
  });
});
