import type { AnalysisResults } from '../types/analysis';

export function exportCashflowCsv(results: AnalysisResults) {
  if (!results.fin.cashflows.length) {
    window.alert('Run the analysis first.');
    return;
  }

  const rows = [['Year', 'Generation_kWh', 'Tariff_Rs_kWh', 'Savings_Rs', 'OM_Rs', 'Net_CF_Rs', 'Cumulative_Rs']];
  results.fin.cashflows.forEach((c) => {
    rows.push([
      String(c.n),
      String(Math.round(c.gen_n)),
      c.tariff_n.toFixed(2),
      String(Math.round(c.savings_n)),
      String(Math.round(c.om_n + c.ins_n)),
      String(Math.round(c.net_cf)),
      String(Math.round(c.cum - results.fin.net_capex)),
    ]);
  });

  const csv = rows.map((row) => row.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  a.download = 'SolarBESS_Cashflow.csv';
  a.click();
}
