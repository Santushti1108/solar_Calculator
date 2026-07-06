import type {
  AnalysisResults,
  AnalysisState,
  BessResult,
  CapexResult,
  EnvResult,
  FinanceResult,
  LoadResult,
  Scenario,
  SolarResult,
  SystemMode,
} from '../types/analysis';
import { COLORS, MONTHLY_FACTORS } from './constants';
import { fmt } from './format';


const emptyFinance: FinanceResult = {
  savings_yr1: 0,
  grid_savings_yr1: 0,
  net_meter_revenue_yr1: 0,
  dg_savings_yr1: 0,
  voll_benefits_yr1: 0,
  ev_savings_yr1: 0,
  benefits: { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0 },
  npv: { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0 },
  irr: { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0 },
  payback: 0,
  disc_payback: 0,
  lcoe: 0,
  roi: 0,
  bcr: 0,
  cashflows: [],
  years: [],
  net_capex: 0,
};

export function isOnGridMode(mode: SystemMode) {
  return mode === 'ongrid-rts-bess' || mode === 'ongrid-rts-bess-ev' || mode === 'grid-bess' || mode === 'grid-bess-ev';
}

export function isOffGridMode(mode: SystemMode) {
  return mode === 'offgrid-rts-bess' || mode === 'offgrid-rts-bess-ev';
}

export function isRtsMode(mode: SystemMode) {
  return mode === 'offgrid-rts-bess' || mode === 'ongrid-rts-bess' || mode === 'offgrid-rts-bess-ev' || mode === 'ongrid-rts-bess-ev';
}

export function isEvMode(mode: SystemMode) {
  return mode === 'offgrid-rts-bess-ev' || mode === 'ongrid-rts-bess-ev' || mode === 'grid-bess-ev';
}

function yearsOfNPV(
  cashflows: Array<{ disc_cf: number }>,
  netCapex: number
): Record<5 | 10 | 15 | 20 | 25, number> {
  const calc = (years: number) =>
    cashflows
      .slice(0, years)
      .reduce((sum, cf) => sum + cf.disc_cf, 0) - netCapex;

  return {
    5: calc(5),
    10: calc(10),
    15: calc(15),
    20: calc(20),
    25: calc(25),
  };
}

function yearsOfIRR(
  cashflows: Array<{ net_cf: number }>,
  netCapex: number
): Record<5 | 10 | 15 | 20 | 25, number> {
  const calc = (years: number) => {
    const periodCashflows = cashflows.slice(0, years);
    let irr = computeIrrNewton(netCapex, periodCashflows);
    if (irr === null || !Number.isFinite(irr) || irr < -0.99 || irr > 10) {
      irr = computeIrrBisection(netCapex, periodCashflows) ?? Number.NaN;
    }
    return irr * 100;
  };

  return {
    5: calc(5),
    10: calc(10),
    15: calc(15),
    20: calc(20),
    25: calc(25),
  };
}

function clampPct(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function resolveAnnualOutageHours(state: AnalysisState, solar: SolarResult) {
  const rte = state.inputs.rte / 100;
  const solarChargingDays = solar.yearly_bess_charging_days;

  if (solarChargingDays > 0 && rte > 0) {
    const hoursPerDay = 24;
    const solarBackupChargingFactor = 1.5;
    return (solarChargingDays * hoursPerDay * rte) / solarBackupChargingFactor;
  }

  return Math.max(state.inputs.autonomyHours, state.inputs.backupHours, 0) * Math.max(state.inputs.occupancyDays, 0);
}

function yearsOfBenefits(
  cashflows: Array<{
    grid_savings_n: number;
    export_revenue_n: number;
    dg_savings_n: number;
    voll_benefits_n: number;
    
  }>
): Record<5 | 10 | 15 | 20 | 25, number> {
  const totalBenefit = (cf: typeof cashflows[number]) =>
    cf.grid_savings_n +
    cf.export_revenue_n +
    cf.dg_savings_n +
    cf.voll_benefits_n 
   

  return {
    5: cashflows.slice(0, 5).reduce((sum, cf) => sum + totalBenefit(cf), 0),
    10: cashflows.slice(0, 10).reduce((sum, cf) => sum + totalBenefit(cf), 0),
    15: cashflows.slice(0, 15).reduce((sum, cf) => sum + totalBenefit(cf), 0),
    20: cashflows.slice(0, 20).reduce((sum, cf) => sum + totalBenefit(cf), 0),
    25: cashflows.slice(0, 25).reduce((sum, cf) => sum + totalBenefit(cf), 0),
  };
}

export function computeLoad(state: AnalysisState): LoadResult {
  const { inputs } = state;
  let daily = 0;
  let average = 0;
  let peak = 0;
  let criticalDaily = 0;
  let criticalPeak = 0;
  let nonCriticalDaily = 0;
  let nonCriticalPeak = 0;

  if (state.loadMethod === 'auto') {
    daily = inputs.area * inputs.eui;
    average = daily / 24;
    peak = average;
  } else if (state.loadMethod === 'appliance') {
    const critical = state.appliances.filter((item) => item.priority === 'critical');
    const nonCritical = state.appliances.filter((item) => item.priority === 'non_critical');

    criticalDaily = critical.reduce((sum, item) => sum + (item.qty * item.w * item.hrs) / 1000, 0);
    criticalPeak = critical.reduce((sum, item) => sum + (item.qty * item.w) / 1000, 0);
    nonCriticalDaily = nonCritical.reduce((sum, item) => sum + (item.qty * item.w * item.hrs) / 1000, 0);
    nonCriticalPeak = nonCritical.reduce((sum, item) => sum + (item.qty * item.w) / 1000, 0);

    daily = criticalDaily + nonCriticalDaily;
    average = daily / 24;
    peak = criticalPeak + nonCriticalPeak;
  } else if (state.loadMethod === 'bill') {
    daily = inputs.tariff > 0 ? (inputs.billAmount / inputs.tariff) / 30 : 0;
    average = daily / 24;
    peak = inputs.contractDemand * 0.8;
  } else {
    daily = inputs.directDailyKwh;
    average = daily / 24;
    peak = inputs.directPeakKw;
  }

  return {
    daily_kwh: daily,
    peak_kw: peak,
    annual_kwh: daily * 365,
    average_kw: average,
    critical_daily_kwh: criticalDaily,
    critical_peak_kw: criticalPeak,
    non_critical_daily_kwh: nonCriticalDaily,
    non_critical_peak_kw: nonCriticalPeak,
  };
}

export function computeBess(state: AnalysisState, load = computeLoad(state)): BessResult {
  const { inputs } = state;
  const dod = inputs.dod / 100 || 1;
  const rte = inputs.rte / 100 || 1;
  const chemCycles = { LFP: 4000, NMC: 2000, 'Lead-Acid': 500 };
  const cycleLife = chemCycles[inputs.chemistry] || 4000;
  let selectedDailyLoad = load.daily_kwh;
  let selectedPeakLoad = load.peak_kw || load.average_kw;

  if (state.loadMethod === 'appliance') {
    if (inputs.batteryCoverage === 'critical') {
      selectedDailyLoad = load.critical_daily_kwh || load.daily_kwh;
      selectedPeakLoad = load.critical_peak_kw || load.peak_kw;
    } else if (inputs.batteryCoverage === 'non_critical') {
      selectedDailyLoad = load.non_critical_daily_kwh || load.daily_kwh;
      selectedPeakLoad = load.non_critical_peak_kw || load.peak_kw;
    }
  }

  const autonomyFraction = inputs.autonomyHours / 24;
  const kwh = (selectedDailyLoad * autonomyFraction ) / (dod * rte);
  const kw = selectedPeakLoad * 1.2;
  const life_yrs = cycleLife / (365 * inputs.dailyCycles || 1);

  return { kwh, kw, life_yrs, chem: inputs.chemistry, cost_kwh: inputs.bessCostKwh };

}

export function computeSolar(state: AnalysisState, load = computeLoad(state), bess = computeBess(state, load)): SolarResult {
  const { inputs } = state;
  const hasRts = isRtsMode(inputs.systemMode);

  if (!hasRts) {
    return {
      kwp: 0,
      panels: 0,
      roof_req: 0,
      annual_gen: 0,
      degrad: inputs.degradation / 100,
      psh: inputs.psh,
      PR: 1 - inputs.lossFactor / 100,
      solar_hour_load: 0,
      non_solar_hour_load: load.daily_kwh,
      inverter_kw: 0,
      yearly_bess_charging_days: 0,
      annual_net_meter_energy: 0,
      export_revenue_yr1: 0,
    };
  }
  
  const cuf = (inputs.solarCuf || 18) / 100;
  const dailyConsumption = load.daily_kwh;
  const solarShare = (inputs.solarTimeShare || 40) / 100;
  const batteryChargingRequirement =  bess.kwh;
  const yearlyOutageHours = 645;
  const solarHourLoad = dailyConsumption * solarShare;
  const annualSolarHourLoad = solarHourLoad * 365;
  const nonSolarHourLoad = Math.max(dailyConsumption - solarHourLoad, 0);
  const targetDailySolar = solarHourLoad + batteryChargingRequirement;
  const kwp = Math.ceil((targetDailySolar / (24 * cuf || 1)) * 10) / 10;
  const panels = Math.ceil((kwp * 1000) / (inputs.panelWp ||1));
  const roofReq = panels * inputs.panelArea;
  // const annualGen = kwp * 24 * cuf * 365;
  // const monthlyGenMwh = MONTHLY_FACTORS.map((factor) => Number(((annualGen / 12 / 1000) * factor).toFixed(2)));
  const inverterKw = Math.ceil(load.peak_kw * 1.5 * 10) / 10;
  const rte = inputs.rte / 100;
  const yearlyBessCharging = ((yearlyOutageHours / rte) * 1.5) / 24;
  const annualgen = kwp * cuf * 24 * 365;
  const annualLoad = dailyConsumption * 365;
  const annualNetMeterEnergy = annualgen -(bess.kwh * yearlyBessCharging) -annualSolarHourLoad;
  const exportRevenueYr1 =
    isOnGridMode(inputs.systemMode) ?
      annualNetMeterEnergy *
      inputs.gridExportTariff :
      0;

    console.log({
  annualgen,
  annualLoad,
  bessSize: bess.kwh,
  yearlyBessCharging,
  batteryChargingEnergy: bess.kwh * yearlyBessCharging,
  annualNetMeterEnergy,
});

  return {
    kwp,
    panels,
    roof_req: roofReq,
    annual_gen: annualgen,
    degrad: inputs.degradation / 100,
    psh: inputs.psh,
    PR: 1 - inputs.lossFactor / 100,
    // monthlyGenMwh,
    solar_hour_load: solarHourLoad,
    non_solar_hour_load: nonSolarHourLoad,
    inverter_kw: inverterKw,
    yearly_bess_charging_days: yearlyBessCharging,
    annual_net_meter_energy: annualNetMeterEnergy,
    export_revenue_yr1: exportRevenueYr1,
  };
}



function computeEmi(principal: number, annualRate: number, years: number) {
  if (!principal || !years) return 0;
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;
  if (!monthlyRate) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

export function computeCapex(state: AnalysisState, solar = computeSolar(state), bess = computeBess(state)): CapexResult {
  const { inputs } = state;
  const hasRts = isRtsMode(inputs.systemMode);
  const solarCapex = hasRts ? solar.kwp * inputs.panelCost : 0;
  const inverterCapex = hasRts ? solar.inverter_kw * inputs.inverterCost : 0;
  const batteryCapex = bess.kwh * inputs.bessCostKwh;
  const componentSubtotal = solarCapex + inverterCapex + batteryCapex;
  const installation = (componentSubtotal * inputs.installCost) / 100;
  const netMetering = 0;
  const reSubtotal = componentSubtotal + installation;
  const engineering = 0;
  const contingency = 0;
  const gst = 0;
  const totalReCapex = reSubtotal;
  const includeEvCost = isEvMode(inputs.systemMode) && inputs.evCostOption === 'included';
  const evPurchaseCost = includeEvCost ? inputs.evPurchaseCost : 0;
  const chargingInfra = includeEvCost ? inputs.chargingInfraCost : 0;
  const totalProjectCapex = totalReCapex + evPurchaseCost + chargingInfra;
  const solarSubsidy = hasRts ? (solar.kwp <= 1 ? 30000 : solar.kwp <= 2 ? 60000 : 78000) : 0;
  const subsidy = inputs.governmentSubsidy === 'yes' ? solarSubsidy : 0;
  const capexWithSubsidy = Math.max(totalProjectCapex - subsidy, 0);
  const capexWithoutSubsidy = totalProjectCapex;
  const loanAmountAfterSubsidy = inputs.externalFinancing === 'yes' ? (capexWithSubsidy * inputs.loanPct) / 100 : 0;
  const loanAmountWithoutSubsidy = inputs.externalFinancing === 'yes' ? (capexWithoutSubsidy * inputs.loanPct) / 100 : 0;
  const equityAfterSubsidy = capexWithSubsidy - loanAmountAfterSubsidy;
  const equityWithoutSubsidy = capexWithoutSubsidy - loanAmountWithoutSubsidy;
  const emiAfterSubsidy = computeEmi(loanAmountAfterSubsidy, inputs.interestRate, inputs.tenure);
  const emiWithoutSubsidy = computeEmi(loanAmountWithoutSubsidy, inputs.interestRate, inputs.tenure);

  return {
    total: totalProjectCapex,
    net: capexWithSubsidy,
    subtotal: reSubtotal,
    components: {
      'Solar CAPEX': solarCapex,
      'Battery CAPEX': batteryCapex,
      'Inverter CAPEX': inverterCapex,
      'Installation & Net Metering': installation,
      'EV Purchase Cost': evPurchaseCost,
      'Charging Infrastructure': chargingInfra,
    },
    om_pct: inputs.omPct,
    ins_pct: inputs.insurancePct,
    subsidy,
    solar_capex: solarCapex,
    battery_capex: batteryCapex,
    inverter_capex: inverterCapex,
    installation,
    net_metering: netMetering,
    total_re_capex: totalReCapex,
    ev_purchase_cost: evPurchaseCost,
    charging_infra: chargingInfra,
    total_project_capex: totalProjectCapex,
    capex_with_subsidy: capexWithSubsidy,
    capex_without_subsidy: capexWithoutSubsidy,
    loan_amount: loanAmountAfterSubsidy,
    equity_amount: equityAfterSubsidy,
    emi: emiAfterSubsidy,
    loan_amount_after_subsidy: loanAmountAfterSubsidy,
    loan_amount_without_subsidy: loanAmountWithoutSubsidy,
    equity_after_subsidy: equityAfterSubsidy,
    equity_without_subsidy: equityWithoutSubsidy,
    emi_after_subsidy: emiAfterSubsidy,
    emi_without_subsidy: emiWithoutSubsidy,
  };
}

// export function computeFinance(
//   state: AnalysisState,
//   solar = computeSolar(state),
//   bess = computeBess(state),
//   capex = computeCapex(state, solar, bess),
// ): FinanceResult {
//   const { inputs } = state;
//   const netCapex = capex.net;
//   if (!netCapex) return emptyFinance;

//   const tariffEsc = inputs.tariffEscalation / 100;
//   const discountRate = inputs.discountRate / 100;
//   const life = inputs.projectLife || 25;
//   const canExport = isRtsMode(inputs.systemMode) && isOnGridMode(inputs.systemMode);
//   const selfCon = canExport ? Math.max(0, 1 - inputs.exportPct / 100) : 1;
//   const exportPct = canExport ? inputs.exportPct / 100 : 0;
//   const inflation = inputs.inflation / 100;
//   const omPct = capex.om_pct / 100;
//   const insPct = capex.ins_pct / 100;
//   const initialBatteryCost = bess.kwh * inputs.bessCostKwh;
//   const batteryReplacementCost = initialBatteryCost * 0.6;
//   const batteryReplacementYear = Math.ceil(bess.life_yrs);
//   const inverterReplacementCost = capex.inverter_capex * 0.8;
//   const inverterReplacementYear = 11;
//   const cashflows = [];
//   const years = [];
//   let cumulative = 0;
//   let discCumulative = 0;
//   let simplePayback: number | null = null;
//   let discPayback: number | null = null;
//   const hasRTS = isRtsMode(inputs.systemMode);
//   const hasEV = isEvMode(inputs.systemMode);
//   const onGrid = isOnGridMode(inputs.systemMode);

//   for (let n = 1; n <= life; n += 1) {
//     const gen_n = hasRTS ? solar.annual_gen * Math.pow(1 - solar.degrad, n - 1) :0;
//     const tariff_n = inputs.gridImportTariff * Math.pow(1 + tariffEsc, n - 1);
//     const grid_savings_n = hasRTS ? gen_n * selfCon * tariff_n :0;
//    const annualNetMeterEnergy =
//   hasRTS
//     ? Math.max(
//         solar.annual_net_meter_energy *
//           Math.pow(1 - solar.degrad, n - 1),
//         0
//       )
//     : 0;

// const export_revenue_n =
//   onGrid
//     ? annualNetMeterEnergy * inputs.gridExportTariff
//     : 0;
//     const dg_savings_n = isOffGridMode(inputs.systemMode) ? gen_n * Math.max(inputs.dgCost - tariff_n, 0) : 0;
//     const voll_benefits_n = inputs.vollBenefit * Math.pow(1 + inflation, n - 1);
//     const ev_savings_n = hasEV && inputs.evCostOption === "included"
//     ? inputs.evAnnualSavings *
//       Math.pow(1 + inflation, n - 1)
//     : 0;
//     const savings_n = grid_savings_n + export_revenue_n + dg_savings_n + voll_benefits_n + ev_savings_n;
//     const om_n = capex.total_re_capex * omPct * Math.pow(1 + inflation, n - 1);
//     const ins_n = capex.total_re_capex * insPct * Math.pow(1 + inflation, n - 1);
//     const bess_capex_n = batteryReplacementYear > 0 && bess.kwh > 0 && n % batteryReplacementYear === 0 ? batteryReplacementCost : 0;
//     const inverter_capex_n = inverterReplacementYear > 0 && n % inverterReplacementYear === 0 ? inverterReplacementCost : 0;
//     const net_cf = savings_n - om_n - ins_n - bess_capex_n - inverter_capex_n;
//     const disc_cf = net_cf / Math.pow(1 + discountRate, n);

//     cumulative += net_cf;
//     discCumulative += disc_cf;
//     if (simplePayback === null && cumulative - netCapex >= 0) simplePayback = n;
//     if (discPayback === null && discCumulative - netCapex >= 0) discPayback = n;

//     cashflows.push({
//       n,
//       gen_n,
//       tariff_n,
//       savings_n,
//       om_n,
//       ins_n,
//       bess_capex_n,
//       inverter_capex_n,
//       net_cf,
//       disc_cf,
//       cum: cumulative,
//       disc_cum: discCumulative,
//       grid_savings_n,
//       export_revenue_n,
//       dg_savings_n,
//       voll_benefits_n,
//       ev_savings_n,
//     });
//     years.push(n);
//   }

//   const savings_yr1 = cashflows[0]?.savings_n || 0;
//   const payback =
//   simplePayback ??
//   (savings_yr1 > 0
//     ? netCapex / savings_yr1
//     : Infinity);
//   const npv = discCumulative - netCapex;
//   let irr = 0.1;

//   for (let iter = 0; iter < 100; iter += 1) {
//     let f = -netCapex;
//     let df = 0;
//     cashflows.forEach(({ net_cf }, i) => {
//       const t = i + 1;
//       f += net_cf / Math.pow(1 + irr, t);
//       df += (-t * net_cf) / Math.pow(1 + irr, t + 1);
//     });
//     if (Math.abs(f) < 1 || !df) break;
//     irr -= f / df;
//   }
 

//   const pvOpex = cashflows.reduce((sum, { om_n, ins_n, bess_capex_n, inverter_capex_n }, i) => sum + (om_n + ins_n + bess_capex_n + inverter_capex_n) / Math.pow(1 + discountRate, i + 1), 0);
//   const pvGen = cashflows.reduce((sum, { gen_n }, i) => sum + gen_n / Math.pow(1 + discountRate, i + 1), 0);
//   const lcoe = (netCapex + pvOpex) / (pvGen || 1);
//   const roi = (cashflows.reduce((sum, { net_cf }) => sum + net_cf, 0) / netCapex) * 100;
//   const npvSavings = cashflows.reduce((sum, { savings_n }, i) => sum + savings_n / Math.pow(1 + discountRate, i + 1), 0);

//   return {
//     savings_yr1,
//     grid_savings_yr1: cashflows[0]?.grid_savings_n || 0,
//     net_meter_revenue_yr1: cashflows[0]?.export_revenue_n || 0,
//     dg_savings_yr1: cashflows[0]?.dg_savings_n || 0,
//     voll_benefits_yr1: cashflows[0]?.voll_benefits_n || 0,
//     ev_savings_yr1: cashflows[0]?.ev_savings_n || 0,
//     benefits: yearsOfBenefits(cashflows),
//     npv,
//     irr: irr * 100,
//     payback,
//     disc_payback: discPayback || payback,
//     lcoe,
//     roi,
//     bcr: npvSavings / netCapex,
//     cashflows,
//     years,
//     net_capex: netCapex,
//   };
// }



// ── Capability resolution ────────────────────────────────────────────────
// Single source of truth for what each system mode supports. Every benefit
// stream below reads from this object instead of re-deriving mode checks
// inline. This is what prevents a stream (like DG-avoided) from silently
// losing its gating logic when mode logic changes elsewhere.
function resolveCapabilities(mode: SystemMode) {
  const hasSolar = isRtsMode(mode);
  const onGrid = isOnGridMode(mode);
  return {
    hasSolar,
    canExport: hasSolar && onGrid,
    // Every one of your 6 modes includes BESS, so backup value always exists.
    // If a future mode ever drops the battery, this becomes hasBattery(mode).
    hasBattery: true,
    hasEV: isEvMode(mode),
  };
}

export function computeFinance(
  state: AnalysisState,
  solar = computeSolar(state),
  bess = computeBess(state),
  capex = computeCapex(state, solar, bess),
): FinanceResult {
  const { inputs } = state;
  const netCapex = capex.net;
  if (!netCapex) return emptyFinance;

  const cap = resolveCapabilities(inputs.systemMode);

  const tariffEsc = inputs.tariffEscalation / 100;
  const discountRate = inputs.discountRate / 100;
  const life = inputs.projectLife || 25;
  const selfCon = cap.canExport ? clampPct(inputs.selfConsumption) / 100 : 1;
  const inflation = inputs.inflation / 100;
  const omPct = capex.om_pct / 100;
  const insPct = capex.ins_pct / 100;
  const initialBatteryCost = bess.kwh * inputs.bessCostKwh;
  const batteryReplacementCost = initialBatteryCost * 0.6;
  const batteryReplacementYear = Math.ceil(bess.life_yrs);
  const inverterReplacementCost = capex.inverter_capex * 0.8;
  const inverterReplacementYear = 11;

  // ── TODO: replace with your real battery dispatch/cycling model ──────
  // Placeholder: assumes the battery runs ~1 full usable cycle/day for
  // backup duty, independent of charge source (solar or grid). This is
  // what lets DG-avoided and VoLL survive in Grid+BESS mode, where there's
  // no gen_n to piggyback on. Swap this out once you have real dispatch
  // data (e.g. from your Excel diesel-runtime model).
  // const usableDoD = inputs.bessDoD ? inputs.bessDoD / 100 : 0.9;
  // const dailyDischarge = cap.hasBattery ? bess.kwh * usableDoD : 0;
  // const annualBatteryDischarge = dailyDischarge * 365;

  const load = computeLoad(state);
  const annualOutageHours = resolveAnnualOutageHours(state, solar);
  const backupLoad = load.critical_peak_kw > 0 ? load.critical_peak_kw : load.peak_kw;
  const backupEnergy = backupLoad * annualOutageHours;
  const lostEnergy = load.average_kw * annualOutageHours;


  const cashflows = [];
  const years = [];
  let cumulative = 0;
  let discCumulative = 0;
  let simplePayback: number | null = null;
  let discPayback: number | null = null;

  for (let n = 1; n <= life; n += 1) {
    const gen_n = cap.hasSolar ? solar.annual_gen * Math.pow(1 - solar.degrad, n - 1) : 0;
    const tariff_n = inputs.gridImportTariff * Math.pow(1 + tariffEsc, n - 1);

    // Grid Savings — solar self-consumption only. Correctly zero for Grid+BESS.
    const grid_savings_n = cap.hasSolar ? gen_n * selfCon * tariff_n : 0;

    // Net Meter / Export Revenue — on-grid RTS only. Correctly zero for Grid+BESS.
    const annualNetMeterEnergy = cap.hasSolar
      ? Math.max(solar.annual_net_meter_energy * Math.pow(1 - solar.degrad, n - 1), 0)
      : 0;
    const export_revenue_n = cap.canExport ? annualNetMeterEnergy * inputs.gridExportTariff : 0;

    // DG Cost Avoided — now driven by battery discharge, not solar generation.
    // This is the actual bug fix: previously gated on isOffGridMode(mode) AND
    // multiplied by gen_n, which zeroed out for Grid+BESS entirely.
  const dgCost_n =
  inputs.dgCost *
  Math.pow(1 + inputs.fuelEscalation / 100, n - 1);

  const dg_savings_n =
  cap.hasBattery
    ? backupEnergy * dgCost_n
    : 0;
    // VoLL — backup availability, not solar. Already correct in original code;
    // left untouched, just now explicitly gated on cap.hasBattery.
    const voll_benefits_n = cap.hasBattery
  ? lostEnergy *
    inputs.vollRate *
    Math.pow(1 + inflation, n - 1)
  : 0;

    const ev_savings_n = cap.hasEV && inputs.evCostOption === "included"
      ? inputs.evAnnualSavings * Math.pow(1 + inflation, n - 1)
      : 0;

    const savings_n = grid_savings_n + export_revenue_n + dg_savings_n + voll_benefits_n + ev_savings_n;
    const om_n = capex.total_re_capex * omPct * Math.pow(1 + inflation, n - 1);
    const ins_n = capex.total_re_capex * insPct * Math.pow(1 + inflation, n - 1);
    const bess_capex_n = batteryReplacementYear > 0 && bess.kwh > 0 && n % batteryReplacementYear === 0 ? batteryReplacementCost : 0;
    const inverter_capex_n = inverterReplacementYear > 0 && n % inverterReplacementYear === 0 ? inverterReplacementCost : 0;
    const net_cf = savings_n - om_n - ins_n - bess_capex_n - inverter_capex_n;
    const disc_cf = net_cf / Math.pow(1 + discountRate, n);

    cumulative += net_cf;
    discCumulative += disc_cf;
    if (simplePayback === null && cumulative - netCapex >= 0) simplePayback = n;
    if (discPayback === null && discCumulative - netCapex >= 0) discPayback = n;

    cashflows.push({
      n, gen_n, tariff_n, savings_n, om_n, ins_n, bess_capex_n, inverter_capex_n,
      net_cf, disc_cf, cum: cumulative, disc_cum: discCumulative,
      grid_savings_n, export_revenue_n, dg_savings_n, voll_benefits_n, ev_savings_n,
    });
    years.push(n);

    if (n === 1) {
  console.table({
    gridSavings: grid_savings_n,
    exportRevenue: export_revenue_n,
    dgSavings: dg_savings_n,
    vollBenefit: voll_benefits_n,
    evSavings: ev_savings_n,
    totalSavings: savings_n,
    om: om_n,
    insurance: ins_n,
    batteryReplacement: bess_capex_n,
    inverterReplacement: inverter_capex_n,
    netCashFlow: net_cf,
  });
}
  }

  const savings_yr1 = cashflows[0]?.savings_n || 0;
  const payback = simplePayback ?? (savings_yr1 > 0 ? netCapex / savings_yr1 : Infinity);
 const npv = yearsOfNPV(
  cashflows,
  netCapex
);

  // ── IRR via Newton-Raphson with a bisection fallback ──────────────────
  // Newton-Raphson can diverge or oscillate when early cashflows are deeply
  // negative relative to later benefits (common in Grid+BESS before the fix,
  // and still possible in low-benefit scenarios). Fall back to bisection
  // over a sane range rather than returning an unbounded/garbage value.
  const irr = yearsOfIRR(cashflows, netCapex);

  const pvOpex = cashflows.reduce((sum, { om_n, ins_n, bess_capex_n, inverter_capex_n }, i) =>
    sum + (om_n + ins_n + bess_capex_n + inverter_capex_n) / Math.pow(1 + discountRate, i + 1), 0);
  const pvGen = cashflows.reduce((sum, { gen_n }, i) => sum + gen_n / Math.pow(1 + discountRate, i + 1), 0);

  // LCOE is only meaningful when the system actually generates electricity.
  // For Grid+BESS (pvGen === 0), report null rather than a nonsense $/kWh
  // number from dividing by a fallback of 1.
  const lcoe = cap.hasSolar && pvGen > 0 ? (netCapex + pvOpex) / pvGen : null;

  const roi = (cashflows.reduce((sum, { net_cf }) => sum + net_cf, 0) / netCapex) * 100;
  const npvSavings = cashflows.reduce((sum, { savings_n }, i) => sum + savings_n / Math.pow(1 + discountRate, i + 1), 0);

  return {
    savings_yr1,
    grid_savings_yr1: cashflows[0]?.grid_savings_n || 0,
    net_meter_revenue_yr1: cashflows[0]?.export_revenue_n || 0,
    dg_savings_yr1: cashflows[0]?.dg_savings_n || 0,
    voll_benefits_yr1: cashflows[0]?.voll_benefits_n || 0,
    ev_savings_yr1: cashflows[0]?.ev_savings_n || 0,
    benefits: yearsOfBenefits(cashflows),
    npv,
    irr,
    payback,
    disc_payback: discPayback || payback,
    lcoe,
    roi,
    bcr: npvSavings / netCapex,
    cashflows,
    years,
    net_capex: netCapex,
  };
}

function computeIrrNewton(netCapex: number, cashflows: { net_cf: number }[]): number | null {
  let irr = 0.1;
  for (let iter = 0; iter < 100; iter += 1) {
    let f = -netCapex;
    let df = 0;
    cashflows.forEach(({ net_cf }, i) => {
      const t = i + 1;
      f += net_cf / Math.pow(1 + irr, t);
      df += (-t * net_cf) / Math.pow(1 + irr, t + 1);
    });
    if (Math.abs(f) < 1) return irr;
    if (!df) return null;
    irr -= f / df;
    if (!Number.isFinite(irr)) return null;
  }
  return irr;
}

function npvAt(rate: number, netCapex: number, cashflows: { net_cf: number }[]): number {
  return cashflows.reduce((sum, { net_cf }, i) => sum + net_cf / Math.pow(1 + rate, i + 1), -netCapex);
}

function computeIrrBisection(netCapex: number, cashflows: { net_cf: number }[]): number | null {
  let lo = -0.9;
  let hi = 5;
  let fLo = npvAt(lo, netCapex, cashflows);
  let fHi = npvAt(hi, netCapex, cashflows);
  if (fLo * fHi > 0) return null; // no sign change in range — no real root here
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2;
    const fMid = npvAt(mid, netCapex, cashflows);
    if (Math.abs(fMid) < 1) return mid;
    if (fLo * fMid < 0) { hi = mid; fHi = fMid; } else { lo = mid; fLo = fMid; }
  }
  return (lo + hi) / 2;
}

export function computeEnv(state: AnalysisState, solar = computeSolar(state)): EnvResult {
  const co2Factor = 0.82;
  const co2_yr1 = (solar.annual_gen * co2Factor) / 1000;
  let co2_total = 0;
  const cumulativeCo2 = [];

  for (let n = 1; n <= state.inputs.projectLife; n += 1) {
    co2_total += (solar.annual_gen * Math.pow(1 - solar.degrad, n - 1) * co2Factor) / 1000;
    cumulativeCo2.push(Number(co2_total.toFixed(1)));
  }

  return { co2_yr1, co2_total, trees: co2_total * 45, gen_yr1: solar.annual_gen, cumulativeCo2 };
}

export function computeScenarios(state: AnalysisState, solar: SolarResult, bess: BessResult, capex: CapexResult): { scenarios: Scenario[]; bestScenarioIndex: number } {
  const { inputs } = state;
  const life = inputs.projectLife || 25;
  const degrad = solar.degrad || 0.005;

  function scenNPV(name: string, selfCon: number, exportPct: number, exportRate: number, capexMultiplier: number) {
    const netCapex = capex.net * capexMultiplier;
    let disc = 0;
    for (let n = 1; n <= life; n += 1) {
      const generation = solar.annual_gen * Math.pow(1 - degrad, n - 1);
      const tariff = inputs.tariff * Math.pow(1 + inputs.tariffEscalation / 100, n - 1);
      disc += (generation * (selfCon * tariff + exportPct * exportRate)) / Math.pow(1 + inputs.discountRate / 100, n);
    }
    return { name, npv: disc - netCapex, pb: netCapex / (solar.annual_gen * selfCon * inputs.tariff || 1), netCapex };
  }

  const selected = scenNPV('Selected', isOnGridMode(inputs.systemMode) ? 0.8 : 1, isOnGridMode(inputs.systemMode) ? 0.2 : 0, inputs.gridExportTariff, 1);
  const gridBess = scenNPV('Grid + BESS', 0.7, 0, 0, 0.9);
  const rtsBess = scenNPV('RTS + BESS', 1, 0, 0, 1.1);
  const scenarios = [
    { name: selected.name, icon: '*', npv: selected.npv, pb: selected.pb, capex: selected.netCapex, color: COLORS.blue, self: isOnGridMode(inputs.systemMode) ? '80%' : '100%', bess: bess.kwh > 0 ? `${fmt(bess.kwh, 1)} kWh` : '-' },
    { name: gridBess.name, icon: '*', npv: gridBess.npv, pb: gridBess.pb, capex: gridBess.netCapex, color: COLORS.orange, self: '70%', bess: bess.kwh > 0 ? `${fmt(bess.kwh, 1)} kWh` : '-' },
    { name: rtsBess.name, icon: '*', npv: rtsBess.npv, pb: rtsBess.pb, capex: rtsBess.netCapex, color: COLORS.green, self: '100%', bess: bess.kwh > 0 ? `${fmt(bess.kwh, 1)} kWh` : '-' },
  ];
  const bestScenarioIndex = scenarios.reduce((best, scenario, index) => (scenario.npv > scenarios[best].npv ? index : best), 0);
  return { scenarios, bestScenarioIndex };
}

export function computeAll(state: AnalysisState): AnalysisResults {
  const load = computeLoad(state);
  const bess = computeBess(state, load);
  const solar = computeSolar(state, load, bess);
  const capex = computeCapex(state, solar, bess);
  const fin = computeFinance(state, solar, bess, capex);
  const env = computeEnv(state, solar);
  const { scenarios, bestScenarioIndex } = computeScenarios(state, solar, bess, capex);
  return { load, solar, bess, capex, fin, env, scenarios, bestScenarioIndex };
}
