export interface SolarReportTypes{
  project: {
    location: string,
    lat: number,
    long: number
  };

  system: {
    systemType: string,
    configuration: string
  };

  capex: {
    solarPVUnitCost: number,
    bessUnitCost: number,
    inverterUnitCost: number,

    includeGovernmentSubsidy: boolean,
    externalFinancing: boolean,

    loanPercent?: number,
    loanInterestRate?: number,
    loanTenure?: number
  };

  outputs: {
    solarSize: number | string,
    panelCount: number | string,
    batterySize: number | string,
    netCapex: number | string,
    annualSaving: number | string,
    payback: number | string,
    npv: number | string,
    irr: number | string,
    co2Offset: number | string,
    lcoe: number | string,
    firstYrGeneration: number | string
  },
  charts: {
    envChartImage: string | null,
    dashboardChartImage: string | null
  }
}