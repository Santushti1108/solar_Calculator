import { BarChart } from '../../components/charts/BarChart';
import { Card } from '../../components/common/Card';
import { KpiCard } from '../../components/common/KpiCard';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS } from '../../utils/constants';
import { exportCashflowCsv } from '../../utils/export';
import { isRtsMode } from '../../utils/calculations';
import { fmt, fmtC } from '../../utils/format';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
// import ReportDocument from "../../pdf/ReportDocument";

export function DashboardStep() {
  const { state, results } = useAnalysis();
  const cfs = results.fin.cashflows;
  const hasRts = isRtsMode(state.inputs.systemMode);


  const exportPdf = async () => {
  const report = document.getElementById("report-content");

  if (!report) return;

  const canvas = await html2canvas(report, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff",
    allowTaint: true,
    removeContainer: true,
    logging: false,
    imageTimeout: 0,
    scrollX: 0,
    scrollY: -window.scrollY,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("IRADe_Report.pdf");
};

  return (
    <div className="step-panel visible">
      <div id="report-content">
      <div className="panel-title">
        Final Report / Summary <span>Step 9</span>
      </div>
      <div className="panel-sub"></div>
      <div className="kpi-grid">
        {hasRts ? <KpiCard value={fmt(results.solar.kwp, 1)} unit="kWp" label="Solar Size" /> : null}
        {hasRts ? <KpiCard value={fmt(results.solar.panels)} unit="panels" label="Panel Count" /> : null}
        <KpiCard value={results.bess.kwh > 0 ? fmt(results.bess.kwh, 1) : '-'} unit="kWh" label="Battery Size" tone="orange" />
        <KpiCard value={fmt(results.capex.net / 100000, 1)} unit="Lakh ₹" label="Net CAPEX" />
        <KpiCard value={fmt(results.fin.savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Annual Savings" tone="green" />
        <KpiCard value={fmt(results.fin.payback, 1)} unit="years" label="Payback" />
        <KpiCard value={fmt(results.fin.npv[25] / 100000, 1)} unit="Lakh ₹" label="NPV" tone="orange" />
        <KpiCard value={`${fmt(results.fin.irr[25], 1)}%`} label="IRR" />
        <KpiCard value={fmt(results.env.co2_total, 0)} unit="tonnes" label="CO₂ Offset" tone="green" />
        <KpiCard value={results.fin.lcoe === null ? '-' : fmt(results.fin.lcoe, 2)} unit="₹/kWh" label="LCOE" />
        {/* <KpiCard value={`${fmt(results.fin.roi, 0)}%`} label="ROI (25yr)" tone="orange" /> */}
        {hasRts ? <KpiCard value={fmt(results.solar.annual_gen / 1000, 1)} unit="MWh/yr" label="Year-1 Gen" /> : null}
      </div>
      <Card title="⚡ Generation & Savings Forecast">
        <div className="chart-wrap tall">
          <BarChart
            data={{
              labels: cfs.map((c) => `Yr ${c.n}`),
              datasets: [
                { type: 'bar', label: 'Annual Savings (₹L)', data: cfs.map((c) => Number((c.savings_n / 100000).toFixed(2))), backgroundColor: `${COLORS.green}88`, yAxisID: 'y' },
                { type: 'line', label: 'Generation (MWh)', data: cfs.map((c) => Number((c.gen_n / 1000).toFixed(1))), borderColor: COLORS.orange, borderWidth: 2, pointRadius: 0, yAxisID: 'y1', tension: 0.4 },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: '#94A3B8', font: { size: 11 } } } },
              scales: {
                y: { ticks: { color: COLORS.green }, grid: { color: 'rgba(255,255,255,0.05)' }, position: 'left' },
                y1: { ticks: { color: COLORS.orange }, position: 'right', grid: { display: false } },
                x: { ticks: { color: '#94A3B8', maxTicksLimit: 13 }, grid: { display: false } },
              },
            }}
          />
        </div>
      </Card>
      </div>
      {/* <Card title="📋 25-Year Cash Flow Table (first 10 years)">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Generation (MWh)</th>
                <th>Tariff (₹/kWh)</th>
                <th>Annual Savings</th>
                <th>O&M+Ins</th>
                <th>Net CF</th>
                <th>Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {cfs.slice(0, 10).map((cashflow) => (
                <tr key={cashflow.n}>
                  <td>
                    <span className="badge badge-blue">Yr {cashflow.n}</span>
                  </td>
                  <td>{fmt(cashflow.gen_n / 1000, 1)} MWh</td>
                  <td>₹{fmt(cashflow.tariff_n, 2)}</td>
                  <td className="green-text">{fmtC(cashflow.savings_n, state.inputs.currency)}</td>
                  <td className="red-text">{fmtC(cashflow.om_n + cashflow.ins_n + cashflow.bess_capex_n, state.inputs.currency)}</td>
                  <td className={cashflow.net_cf > 0 ? 'green-text' : 'red-text'}>{fmtC(cashflow.net_cf, state.inputs.currency)}</td>
                  <td className={cashflow.cum - results.fin.net_capex > 0 ? 'green-text' : ''}>{fmtC(cashflow.cum - results.fin.net_capex, state.inputs.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card> */}
      <Card title="📤 Export Report">
        <div className="export-row">
          
          <button className="exp-btn" type="button" onClick={() => window.print()}>
            🖨 Print Report
          </button>
          {/* <PDFDownloadLink
              document={
                  <ReportDocument
                      state={state}
                      results={results}
                  />
              }
              fileName="IRADe_Report.pdf"
              >

                    {({ loading }) => (

                    <button
                        className="exp-btn"
                    >

                    {loading ? "Generating..." : "📄 Export PDF"}

                    </button>

                    )}

                  </PDFDownloadLink> */}
          {/* <button className="exp-btn" type="button" onClick={() => exportCashflowCsv(results)}>
            ⬇ Export CSV
          </button> */}
        </div>
      </Card>
    </div>
  );
}
