export type SystemMode = 'offgrid-rts-bess' | 'ongrid-rts-bess' | 'offgrid-rts-bess-ev' | 'ongrid-rts-bess-ev' | 'grid-bess' | 'grid-bess-ev';
export type EvCostOption = 'included' | 'excluded';
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
  systemMode: SystemMode;
  evCostOption: "included" | "excluded";
  currency: Currency;
  tariff: number;
  gridImportTariff: number;
  gridExportTariff: number;
  tariffEscalation: number;
  discountRate: number;
  projectLife: number;
  buildingCategory: string;
  eui: number;
  area: number;
  occupancyDays: number;
  billAmount: number;
  directDailyKwh: number;
  directPeakKw: number;
  lossFactor: number;
  panelWp: number;
  panelArea: number;
  solarTimeShare: number;
  solarCuf: number;
  batteryChargingRequirement: number;
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
  autonomyHours: number;
  dailyCycles: number;
  bessCostKwh: number;
  batteryCost: number;
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
  omEscalationRate: number;
  insurancePct: number;
  exportRate: number;
  exportPct: number;
  dgCost: number;
  vollBenefit: number;
  evAnnualSavings: number;
  evPurchaseCost: number;
  chargingInfraCost: number;
  netMeteringCost: number;
  governmentSubsidy: 'yes' | 'no';
  externalFinancing: 'yes' | 'no';
  loanPct: number;
  interestRate: number;
  tenure: number;
  inflation: number;
  batteryCoverage:
    |"critical"
    |"non_critical"
    |"all",
  contractDemand: number;
  dieselPrice: number;
  vollRate: number;
  evElectricityCost: number;
  fuelEscalation : number;
  outageEventsPerYear: number;
  outageHoursPerEvent: number;
  predictiveMaintenanceHours: number;
  dieselConsumptionRate: number;
  dgCapacityMultiplier: number;
  dieselCapacityBump: number;
  dgAnnualMaintenance: number;
  evDailyDistance: number;
  petrolMileage: number;
  petrolPrice: number;
  evConsumptionKwhKm: number;
  evOmPct: number;
  batteryReplacementPct: number;
  batteryReplacementYear: number;
  inverterReplacementPct: number;
  inverterReplacementYear: number;
  
}

export interface LoadResult {
  daily_kwh: number;
  peak_kw: number;
  annual_kwh: number;

  average_kw :number;

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
  // monthlyGenMwh: number[];
  solar_hour_load: number;
  non_solar_hour_load: number;
  inverter_kw: number;
  yearly_bess_charging_days: number;
  annual_net_meter_energy: number;
  export_revenue_yr1: number;
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
  solar_capex: number;
  battery_capex: number;
  inverter_capex: number;
  installation: number;
  net_metering: number;
  total_re_capex: number;
  ev_purchase_cost: number;
  charging_infra: number;
  total_project_capex: number;
  capex_with_subsidy: number;
  capex_without_subsidy: number;
  loan_amount: number;
  equity_amount: number;
  emi: number;
  loan_amount_after_subsidy: number;
  loan_amount_without_subsidy: number;
  equity_after_subsidy: number;
  equity_without_subsidy: number;
  emi_after_subsidy: number;
  emi_without_subsidy: number;
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
  grid_savings_n: number;
  export_revenue_n: number;
  dg_savings_n: number;
  voll_benefits_n: number;
  ev_savings_n: number;
  
}

export interface FinanceResult {
  savings_yr1: number;
  grid_savings_yr1: number;
  net_meter_revenue_yr1: number;
  dg_savings_yr1: number;
  voll_benefits_yr1: number;
  ev_savings_yr1: number;
  disc_payback: number;
  lcoe: number|null;
  roi: number;
  bcr: number;
  cashflows: Cashflow[];
  years: number[];
  net_capex: number;
  benefits: Record<5 | 10 | 15 | 20 | 25, number>;
  npv: Record<5 | 10 | 15 | 20 | 25, number>;
  irr: Record<5 | 10 | 15 | 20 | 25, number>;
  payback: number;
  
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
  loadMethod: LoadMethod;
  showWizard: boolean;
  appliances: Appliance[];
  inputs: Inputs;
}
