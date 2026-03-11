// Motor de calculo - funcoes puras, sem DOM

function applyBrackets(rc) {
  if (rc <= 0) return 0;
  for (const b of TAX.BRACKETS) {
    if (rc <= b.limit) return rc * b.rate - b.parcela;
  }
  return 0;
}

function applySobretaxa(rc) {
  let s = 0;
  for (const t of TAX.SOBRETAXA) {
    if (rc > t.min) {
      s += (Math.min(rc, t.max) - t.min) * t.rate;
    }
  }
  return s;
}

function calcIRSJovemDiscount(irs, grossAnual, jovemYear) {
  if (!jovemYear) return 0;
  const rate = TAX.JOVEM_RATES[jovemYear] || 0;
  const exemptIncome = Math.min(grossAnual, TAX.IRS_JOVEM_LIMIT);
  const proportion = grossAnual > 0 ? exemptIncome / grossAnual : 0;
  return irs * proportion * rate;
}

// Calculo completo para Trabalho Dependente
function calcDependente(input) {
  const {
    grossMonthly, familySituation, dependents, dependentsUnder3,
    mealPerDay, mealType, workDays, transportMonthly,
    subsidyMode, irsJovemYear
  } = input;

  const grossAnual = grossMonthly * 14;

  // Seguranca Social
  const ssAnualEmp = grossAnual * TAX.SS_EMPLOYEE;
  const ssAnualEntidade = grossAnual * TAX.SS_EMPLOYER;

  // Deducao especifica = max(4587.09, SS)
  const deducaoEsp = Math.max(TAX.DEDUCAO_ESPECIFICA, ssAnualEmp);

  // Rendimento coletavel = Bruto - Deducao especifica
  let rc = Math.max(0, grossAnual - deducaoEsp);

  // IRS (quociente conjugal para unico titular)
  let irs;
  if (familySituation === 'married-1') {
    irs = applyBrackets(rc / 2) * 2;
  } else {
    irs = applyBrackets(rc);
  }

  irs += applySobretaxa(rc);

  // Deducoes por dependentes
  const depDeduction = dependents * TAX.DEP_DEDUCTION
    + dependentsUnder3 * TAX.DEP_UNDER3_EXTRA;
  irs = Math.max(0, irs - depDeduction);

  // IRS Jovem
  const jovemDiscount = calcIRSJovemDiscount(irs, grossAnual, irsJovemYear);
  irs = Math.max(0, irs - jovemDiscount);

  // Minimo de existencia
  const netCheck = grossAnual - ssAnualEmp - irs;
  if (netCheck < TAX.MINIMO_EXISTENCIA && grossAnual > 0) {
    irs = Math.max(0, grossAnual - ssAnualEmp - TAX.MINIMO_EXISTENCIA);
  }

  // Distribuicao mensal
  const months = subsidyMode === 14 ? 14 : 12;
  const grossMonthlyEff = grossAnual / months;
  const ssMonthly = ssAnualEmp / months;
  const irsMonthly = irs / months;
  const netMonthlyBase = grossMonthlyEff - ssMonthly - irsMonthly;

  // Subsidio alimentacao (11 meses)
  const mealExempt = mealType === 'card' ? TAX.MEAL_EXEMPT_CARD : TAX.MEAL_EXEMPT_CASH;
  const mealCleanDay = Math.min(mealPerDay, mealExempt);
  const mealMonthlyClean = mealCleanDay * workDays;
  const mealMonthlyTotal = mealPerDay * workDays;
  const mealAnnualClean = mealMonthlyClean * 11;
  const mealAnnualTotal = mealMonthlyTotal * 11;

  // Subsidio transporte (11 meses)
  const transportAnnual = transportMonthly * 11;

  const totalNetMonthly = netMonthlyBase + mealMonthlyClean + transportMonthly;

  const netAnual = grossAnual - ssAnualEmp - irs;
  const totalNetAnual = netAnual + mealAnnualClean + transportAnnual;

  const empCostAnual = grossAnual + ssAnualEntidade + mealAnnualTotal + transportAnnual;
  const empCostMonthly = empCostAnual / 12;

  const rSS = grossAnual > 0 ? ssAnualEmp / grossAnual : 0;
  const rIRS = grossAnual > 0 ? irs / grossAnual : 0;

  return {
    grossMonthly, grossMonthlyEff, grossAnual,
    ssMonthly, ssAnualEmp, ssAnualEntidade,
    deducaoEsp, rc,
    irsMonthly, irs, jovemDiscount, depDeduction,
    netMonthlyBase, totalNetMonthly,
    mealPerDay, mealType,
    mealMonthlyClean, mealMonthlyTotal, mealAnnualClean, mealAnnualTotal,
    transportMonthly, transportAnnual,
    netAnual, totalNetAnual,
    empCostMonthly, empCostAnual,
    rSS, rIRS, rTotal: rSS + rIRS,
    subsidyMode: months,
    warnings: grossMonthly > 0 && grossMonthly < TAX.MIN_WAGE
      ? ['Salario abaixo do salario minimo nacional (' + fmt(TAX.MIN_WAGE) + ')'] : [],
  };
}

// Calculo completo para Trabalho Independente (regime simplificado)
function calcIndependente(input) {
  const {
    grossMonthly, familySituation, dependents, dependentsUnder3,
    firstYearExempt, irsJovemYear
  } = input;

  const grossAnual = grossMonthly * 12;

  // SS (21.4% sobre 70% do rendimento)
  let ssAnual = 0;
  if (!firstYearExempt) {
    ssAnual = grossAnual * TAX.SS_IND_COEFF * TAX.SS_INDEPENDENT;
  }
  const ssMonthly = ssAnual / 12;

  // 75% do rendimento e tributavel
  const rendTributavel = grossAnual * TAX.SIMPLIFIED_COEFF;
  let rc = Math.max(0, rendTributavel);

  let irs;
  if (familySituation === 'married-1') {
    irs = applyBrackets(rc / 2) * 2;
  } else {
    irs = applyBrackets(rc);
  }

  irs += applySobretaxa(rc);

  const depDeduction = dependents * TAX.DEP_DEDUCTION
    + dependentsUnder3 * TAX.DEP_UNDER3_EXTRA;
  irs = Math.max(0, irs - depDeduction);

  const jovemDiscount = calcIRSJovemDiscount(irs, grossAnual, irsJovemYear);
  irs = Math.max(0, irs - jovemDiscount);

  const netCheck = grossAnual - ssAnual - irs;
  if (netCheck < TAX.MINIMO_EXISTENCIA && grossAnual > 0) {
    irs = Math.max(0, grossAnual - ssAnual - TAX.MINIMO_EXISTENCIA);
  }

  const irsMonthly = irs / 12;
  const netMonthly = grossMonthly - ssMonthly - irsMonthly;
  const netAnual = grossAnual - ssAnual - irs;

  const rSS = grossAnual > 0 ? ssAnual / grossAnual : 0;
  const rIRS = grossAnual > 0 ? irs / grossAnual : 0;

  return {
    grossMonthly, grossAnual,
    ssMonthly, ssAnual,
    rendTributavel, rc,
    irsMonthly, irs, jovemDiscount, depDeduction,
    netMonthly, netAnual,
    rSS, rIRS, rTotal: rSS + rIRS,
    warnings: [],
  };
}

// Busca binaria para Liquido → Bruto
function findGross(targetNet, calcFn, baseInput, netField) {
  let lo = 0, hi = targetNet * 4;
  const EPS = 0.01, MAX = 100;

  let r = calcFn({ ...baseInput, grossMonthly: hi });
  while (r[netField] < targetNet && hi < 1000000) {
    hi *= 2;
    r = calcFn({ ...baseInput, grossMonthly: hi });
  }

  for (let i = 0; i < MAX; i++) {
    const mid = (lo + hi) / 2;
    r = calcFn({ ...baseInput, grossMonthly: mid });
    if (Math.abs(r[netField] - targetNet) < EPS) return Math.round(mid * 100) / 100;
    if (r[netField] < targetNet) lo = mid; else hi = mid;
  }
  return Math.round(((lo + hi) / 2) * 100) / 100;
}

// Formatacao
function fmt(v) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2
  }).format(v);
}

function fmtPct(v) {
  return (v * 100).toFixed(1) + '%';
}
