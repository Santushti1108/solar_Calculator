import { Result } from 'postcss';
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
} from '../types/analysis';
import { COLORS, initialState, MONTHLY_FACTORS } from './constants';
import { fmt } from './format';

const emptyFinance: FinanceResult = {
  savings_yr1: 0,
  npv: 0,
  irr: 0,
  payback: 0,
  disc_payback: 0,
  lcoe: 0,
  roi: 0,
  bcr: 0,
  cashflows: [],
  years: [],
  net_capex: 0,
};

export function computeLoad(state: AnalysisState): LoadResult {
  const { inputs } = state;
  let daily = 0;
  let peak = 0;

  let criticalDaily =0;
  let criticalPeak =0;

  let nonCriticalDaily =0;
  let nonCriticalPeak =0;

  if (state.loadMethod === 'auto') {
    const annual = inputs.area * inputs.eui * (inputs.occupancyDays / 365);
    daily = annual / 365;
    peak = daily / 12;
  } else if (state.loadMethod === 'appliance') {

  criticalDaily = state.appliances
  .filter(
    (item)=>
      item.priority === "critical"
  )
  .reduce((sum, item) => sum + (item.qty * item.w * item.hrs) / 1000, 0);
  
  criticalPeak = state.appliances
  .filter(
    (item)=>
      item.priority === "critical"
)
  .reduce((sum, item) => sum + (item.qty * item.w) / 1000, 0) * 0.7;

nonCriticalDaily = 
  state.appliances
    .filter(
      (item)=>
        item.priority ===
      "non_critical"
    )
    .reduce((sum, item)=> sum +(item.qty * item.w * item.hrs)/ 1000, 0);

  nonCriticalPeak = 
    state.appliances
      .filter(
        (item)=>
          item.priority ===
          "non_critical"
      )
      .reduce((sum,item)=> sum + (item.qty * item.w)/1000, 0)*0.7;

  daily = criticalDaily + nonCriticalDaily;
  peak = criticalPeak+nonCriticalPeak;
  

  } else if (state.loadMethod === 'bill') {
    daily = inputs.billKwh / 30;
    peak = daily / 14;
  } else {
    daily = inputs.directDailyKwh;
    peak = inputs.directPeakKw;
  }
console.log("LOAD METHOD =", state.loadMethod);
console.log("APPLIANCES =", state.appliances);

  return { 
    daily_kwh: daily, 
    peak_kw: peak, 
    annual_kwh: daily * 365, 

    critical_daily_kwh: criticalDaily,
    critical_peak_kw: criticalPeak,

    non_critical_daily_kwh: nonCriticalDaily,
    non_critical_peak_kw: nonCriticalPeak,
  };

}
export function computeSolar(state: AnalysisState, load = computeLoad(state)): SolarResult {
  const { inputs } = state;
  const psh = inputs.psh;
  const PR = 1 - inputs.lossFactor / 100;
  const designLoad = load.daily_kwh;
  let kwp = designLoad / (psh * PR || 1);

  if (state.mode === 'off-grid') kwp *= 1.15;
  kwp = Math.ceil(kwp * 2) / 2;

  const panels = Math.ceil((kwp * 1000) / inputs.panelWp);
  const roofReq = panels * inputs.panelArea;
  const annualGen = kwp * psh * PR * 365;
  const monthlyGenMwh = MONTHLY_FACTORS.map((factor) => Number(((kwp * psh * PR * 30 * factor) / 1000).toFixed(2)));

  return {
    kwp,
    panels,
    roof_req: roofReq,
    annual_gen: annualGen,
    degrad: inputs.degradation / 100,
    psh,
    PR,
    monthlyGenMwh,
  };
}

export function computeBess(state: AnalysisState, load = computeLoad(state)): BessResult {
  if (state.mode === 'on-grid') return { kwh: 0, kw: 0, life_yrs: 0 };

  const { inputs } = state;
  const dod = inputs.dod / 100;
  const rte = inputs.rte / 100;
  const chemCycles = { LFP: 4000, NMC: 2000, 'Lead-Acid': 500 };
  const cycleLife = chemCycles[inputs.chemistry] || 4000;
      let selectedPeakLoad = load.peak_kw;
      let selectedDailyLoad = load.daily_kwh;

    if(state.loadMethod === "appliance"){
      switch(inputs.batteryCoverage){
        case "critical":
          selectedPeakLoad = load.critical_peak_kw || load.non_critical_peak_kw;
          selectedDailyLoad = load.critical_daily_kwh || load.daily_kwh;
          break;
          
        case "non_critical":
          selectedPeakLoad = load.non_critical_peak_kw || load.non_critical_peak_kw;
          selectedDailyLoad = load.non_critical_daily_kwh || load.daily_kwh;
          break;

        case "all":
          default:
            selectedPeakLoad = load.peak_kw ;
            selectedDailyLoad = load.daily_kwh;
      }
    }
  const kwh =
    state.mode === 'off-grid'|| 
    state.mode === 'hybrid'
      ? ((selectedPeakLoad || 20) * (inputs.backupHours /24)* inputs.autonomyDays) / (dod * rte || 1)
      : (inputs.peakShaveTarget * inputs.backupHours) / (dod || 1);
  
    // state.mode === 'hybrid'
    //   ? ((selectedPeakLoad || 20) * (inputs.backupHours /24)* inputs.autonomyDays) / (dod * rte || 1)
    //   : (inputs.peakShaveTarget * inputs.backupHours) / (dod || 1);
 

  const kw = selectedPeakLoad * 1.2;
  const life_yrs = cycleLife / (365 * inputs.dailyCycles || 1);

  return { kwh, kw, life_yrs, chem: inputs.chemistry, cost_kwh: inputs.bessCostKwh };
}

export function computeCapex(state: AnalysisState, solar = computeSolar(state), bess = computeBess(state)): CapexResult {
  const { inputs } = state;
  const panels = solar.kwp * 1000 * inputs.panelCost;
  const inverter = solar.kwp * inputs.inverterCost;
  const battery = bess.kwh * inputs.bessCostKwh;
  const mounting = solar.kwp * 1000 * inputs.mountingCost;
  const bos = solar.kwp * 1000 * inputs.bosCost;
  const installation = solar.kwp * 1000 * inputs.installCost;
  const monitoring = inputs.monitoringCost;
  const subtotal = panels + inverter + battery + mounting + bos + installation + monitoring;
  const engineering = (subtotal * inputs.engineeringPct) / 100;
  const contingency = (subtotal * inputs.contingencyPct) / 100;
  const gst = ((subtotal + engineering + contingency) * inputs.gst) / 100;
  const total = subtotal + engineering + contingency + gst;
  const net = Math.max(total - inputs.subsidy, 0);

  return {
    total,
    net,
    subtotal,
    components: {
      Panels: panels,
      Inverter: inverter,
      BESS: battery,
      Mounting: mounting,
      'BoS/Wiring': bos,
      Installation: installation,
      Monitoring: monitoring,
      Engineering: engineering,
      Contingency: contingency,
      GST: gst,
    },
    om_pct: inputs.omPct,
    ins_pct: inputs.insurancePct,
    subsidy: inputs.subsidy,
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
  if (!netCapex || !solar.kwp) return emptyFinance;

  const tariffEsc = inputs.tariffEscalation / 100;
  const discountRate = inputs.discountRate / 100;
  const life = inputs.projectLife || 25;
  const selfCon = inputs.selfConsumption / 100;
  const exportPct = inputs.exportPct / 100;
  const inflation = inputs.inflation / 100;
  const omPct = capex.om_pct / 100;
  const insPct = capex.ins_pct / 100;
  const solarCostPerkwh = capex.net / (solar.annual_gen * life);
  const initialBatteryCost = bess.kwh * inputs.bessCostKwh;
  const batterryRplacementCost = initialBatteryCost * 0.6;
  const batteryCoverageeplacementYear = Math.ceil(bess.life_yrs);
  const initialInverterCost = solar.kwp * inputs.inverterCost;
  const inverterReplacementCost = initialInverterCost * 0.8;
  const inverterReplacementYear = 11;
  const cashflows = [];
  const years = [];
  let cumulative = 0;
  let discCumulative = 0;
  let simplePayback: number | null = null;
  let discPayback: number | null = null;

  for (let n = 1; n <= life; n += 1) {
    const gen_n = solar.annual_gen * Math.pow(1 - solar.degrad, n - 1);
    const tariff_n = inputs.tariff * Math.pow(1 + tariffEsc, n - 1);
    const savings_n =
      state.mode === 'off-grid'
        ? gen_n * Math.max(inputs.dgCost - solarCostPerkwh, 0)
        : gen_n * (selfCon * tariff_n + exportPct * inputs.exportRate);
    const om_n = capex.total * omPct * Math.pow(1 + inflation, n - 1);
    const ins_n = capex.total * insPct * Math.pow(1 + inflation, n - 1);
   
    // const bess_capex_n = bess.life_yrs > 0 && bess.kwh > 0 && Math.round(n) === Math.round(bess.life_yrs) ? bessReplaceCost : 0;
    const bess_capex_n = batteryCoverageeplacementYear > 0 && bess.kwh > 0 && n %batteryCoverageeplacementYear === 0 ?batterryRplacementCost : 0;
    const inverter_capex_n = inverterReplacementYear > 0 && n % inverterReplacementYear === 0 ? inverterReplacementCost : 0;
    const net_cf = savings_n - om_n - ins_n - bess_capex_n - inverter_capex_n;
    const disc_cf = net_cf / Math.pow(1 + discountRate, n);
    

    cumulative += net_cf;
    discCumulative += disc_cf;
    if (simplePayback === null && cumulative - netCapex >= 0) simplePayback = n;
    if (discPayback === null && discCumulative - netCapex >= 0) discPayback = n;
    cashflows.push({ n, gen_n, tariff_n, savings_n, om_n, ins_n, bess_capex_n,inverter_capex_n, net_cf, disc_cf, cum: cumulative, disc_cum: discCumulative });
    years.push(n);

    console.log(
      "Year",
      n,
      "Battery",
      bess_capex_n,
      "Inverter",
      inverter_capex_n
    );
      }

  const savings_yr1 = cashflows[0]?.savings_n || 0;
  const payback = simplePayback || netCapex / (savings_yr1 || 1);
  const npv = discCumulative - netCapex;
  let irr = 0.1;

  for (let iter = 0; iter < 100; iter += 1) {
    let f = -netCapex;
    let df = 0;
    cashflows.forEach(({ net_cf }, i) => {
      const t = i + 1;
      f += net_cf / Math.pow(1 + irr, t);
      df += (-t * net_cf) / Math.pow(1 + irr, t + 1);
    });
    if (Math.abs(f) < 1 || !df) break;
    irr -= f / df;
  }

  const pvOpex = cashflows.reduce(
  (
    sum,
    {
      om_n,
      ins_n,
      bess_capex_n,
      inverter_capex_n,
    },
    i
  ) =>
    sum +
    (
      om_n +
      ins_n +
      bess_capex_n +
      inverter_capex_n
    ) /
      Math.pow(1 + discountRate, i + 1),
  0
);
  const pvGen = cashflows.reduce((sum, { gen_n }, i) => sum + gen_n / Math.pow(1 + discountRate, i + 1), 0);
  const lcoe = (netCapex + pvOpex) / (pvGen || 1);
  const roi = (cashflows.reduce((sum, { net_cf }) => sum + net_cf, 0) / netCapex) * 100;
  const npvSavings = cashflows.reduce((sum, { savings_n }, i) => sum + savings_n / Math.pow(1 + discountRate, i + 1), 0);

  return {
    savings_yr1,
    npv,
    irr: irr * 100,
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

  function scenNPV(selfCon: number, exportPct: number, exportRate: number, bessCostExtra: number) {
    const netCapex = capex.net + bessCostExtra;
    let disc = 0;
    for (let n = 1; n <= life; n += 1) {
      const generation = solar.annual_gen * Math.pow(1 - degrad, n - 1);
      const tariff = inputs.tariff * Math.pow(1 + inputs.tariffEscalation / 100, n - 1);
      disc += (generation * (selfCon * tariff + exportPct * exportRate)) / Math.pow(1 + inputs.discountRate / 100, n);
    }
    return { npv: disc - netCapex, pb: netCapex / (solar.annual_gen * selfCon * inputs.tariff || 1), netCapex };
  }

  const ong = scenNPV(0.8, 0.2, inputs.exportRate || 4, 0);
  const hyb = scenNPV(0.95, 0.05, 2, bess.kwh * inputs.bessCostKwh);
  const off = scenNPV(1.0, 0, 0, bess.kwh * inputs.bessCostKwh * 1.5);
  const scenarios = [
    { name: 'On-Grid', icon: '🔌', npv: ong.npv, pb: ong.pb, capex: ong.netCapex, color: COLORS.blue, self: '80%', bess: 'None' },
    { name: 'Hybrid', icon: '⚡', npv: hyb.npv, pb: hyb.pb, capex: hyb.netCapex, color: COLORS.orange, self: '95%', bess: bess.kwh > 0 ? `${fmt(bess.kwh, 1)} kWh` : 'Opt.' },
    { name: 'Off-Grid', icon: '🏕️', npv: off.npv, pb: off.pb, capex: off.netCapex, color: COLORS.green, self: '100%', bess: bess.kwh > 0 ? `${fmt(bess.kwh * 1.5, 1)} kWh` : '-' },
  ];
  const bestScenarioIndex = scenarios.reduce((best, scenario, index) => (scenario.npv > scenarios[best].npv ? index : best), 0);
  return { scenarios, bestScenarioIndex };
}

export function computeAll(state: AnalysisState): AnalysisResults {
  const load = computeLoad(state);
  const solar = computeSolar(state, load);
  const bess = computeBess(state, load);
  const capex = computeCapex(state, solar, bess);
  const fin = computeFinance(state, solar, bess, capex);
  const env = computeEnv(state, solar);
  const { scenarios, bestScenarioIndex } = computeScenarios(state, solar, bess, capex);
  return { load, solar, bess, capex, fin, env, scenarios, bestScenarioIndex };
}
