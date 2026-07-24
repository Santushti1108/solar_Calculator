import jsPDF from "jspdf";
import { SolarReportTypes } from "./types/report";
import { CoverPage } from "./coverPage";
import { systemSummary } from "./inputOutputPage";
import { chartPage } from "./chartsPage";

export async function generateReport(report: SolarReportTypes) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  await CoverPage(doc, report);
  systemSummary(doc, report);
  chartPage(doc, report);

  doc.save("Solar_Report.pdf");
}