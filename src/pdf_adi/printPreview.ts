import jsPDF from "jspdf";
import { SolarReportTypes } from "./types/report";
import { CoverPage } from "./coverPage";
import { systemSummary } from "./inputOutputPage";
import { chartPage } from "./chartsPage";

export async function printPreview(report: SolarReportTypes) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  await CoverPage(doc, report);
  systemSummary(doc, report);
  chartPage(doc, report);

  window.open(doc.output("bloburl"), "_blank");
}