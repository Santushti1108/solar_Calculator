export type SystemMode = 'on-grid' | 'hybrid' | 'off-grid';
export type LoadMethod = 'auto' | 'appliance' | 'bill' | 'direct';
export type Currency = 'INR' | 'USD' | 'EUR';

export interface Appliance {
  id:string;
  name: string;
  qty: number;
  w: number;
  hrs: number;
  priority:
    | "critical"
    | "non_critical"
}



export interface Inputs {
  projectName: string;
  location: string;
  latitude: number;
  longitude: number;
  psh: number;
  averageTemperature: number;
  currency: Currency;
  tariff: number;
  gridAvailability: number;
  tariffEscalation: number;
  discountRate: number;
  projectLife: number;
  buildingCategory: string;
  eui: number;
  area: number;
  occupancyDays: number;
  billAmount: number;
  billKwh: number;
  directDailyKwh: number;
  directPeakKw: number;
  lossFactor: number;
  panelWp: number;
  panelArea: number;
  degradation: number;
  roofArea: number;
  designLoadOverride: number;
  selfConsumption: number;
  roofAvailable: number;
  roofUsablePct: number;
  roofTilt: number;
  roofType: string;
  dod: number;
  rte: number;
  chemistry: 'LFP' | 'NMC' | 'Lead-Acid';
  backupHours: number;
  autonomyDays: number;
  peakShaveTarget: number;
  dailyCycles: number;
  bessCostKwh: number;
  panelCost: number;
  inverterCost: number;
  mountingCost: number;
  bosCost: number;
  installCost: number;
  monitoringCost: number;
  engineeringPct: number;
  contingencyPct: number;
  gst: number;
  subsidy: number;
  omPct: number;
  insurancePct: number;
  exportRate: number;
  exportPct: number;
  dgCost: number;
  inflation: number;
  batteryCoverage:
    |"critical"
    |"non_critical"
    |"all"
}

export interface LoadResult {
  daily_kwh: number;
  peak_kw: number;
  annual_kwh: number;

  critical_daily_kwh :number;
  critical_peak_kw : number;

  non_critical_daily_kwh : number;
  non_critical_peak_kw : number;
}

export interface SolarResult {
  kwp: number;
  panels: number;
  roof_req: number;
  annual_gen: number;
  degrad: number;
  psh: number;
  PR: number;
  monthlyGenMwh: number[];
}

export interface BessResult {
  kwh: number;
  kw: number;
  life_yrs: number;
  chem?: string;
  cost_kwh?: number;
}

export interface CapexResult {
  total: number;
  net: number;
  subtotal: number;
  components: Record<string, number>;
  om_pct: number;
  ins_pct: number;
  subsidy: number;
}

export interface Cashflow {
  n: number;
  gen_n: number;
  tariff_n: number;
  savings_n: number;
  om_n: number;
  ins_n: number;
  bess_capex_n: number;
  net_cf: number;
  disc_cf: number;
  cum: number;
  disc_cum: number;
  inverter_capex_n: number;
  
}

export interface FinanceResult {
  savings_yr1: number;
  npv: number;
  irr: number;
  payback: number;
  disc_payback: number;
  lcoe: number;
  roi: number;
  bcr: number;
  cashflows: Cashflow[];
  years: number[];
  net_capex: number;
}

export interface EnvResult {
  co2_yr1: number;
  co2_total: number;
  trees: number;
  gen_yr1: number;
  cumulativeCo2: number[];
}

export interface Scenario {
  name: string;
  icon: string;
  npv: number;
  pb: number;
  capex: number;
  color: string;
  self: string;
  bess: string;
}

export interface AnalysisResults {
  load: LoadResult;
  solar: SolarResult;
  bess: BessResult;
  capex: CapexResult;
  fin: FinanceResult;
  env: EnvResult;
  scenarios: Scenario[];
  bestScenarioIndex: number;
}

export interface AnalysisState {
  step: number;
  totalSteps: number;
  mode: SystemMode;
  loadMethod: LoadMethod;
  showWizard: boolean;
  appliances: Appliance[];
  inputs: Inputs;
}
