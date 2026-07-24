import jsPDF from "jspdf";
import { SolarReportTypes } from "./types/report";
import { COLORS, SPACING } from "./helper/theme";

export function chartPage(doc: jsPDF, report: SolarReportTypes) {
  doc.addPage();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const centerX = pageWidth / 2;

  const [r_primary, g_primary, b_primary] = COLORS.primary;
  const [r_title,g_title,b_title] = COLORS.white;
  const [r_light, g_light, b_light] = COLORS.light;
  const [r_sec, g_sec, b_sec] = COLORS.secondary;
  const [r_black, g_black, b_black] = COLORS.black;
  const [r_gray, g_gray, b_gray] = COLORS.gray;

  // TITLE
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(r_black, g_black, b_black)

  doc.text("CHARTS AND VISUALIZATIONS", centerX, 18, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(r_black, g_black, b_black);

  doc.text("Environmental Impact", 15, 32);

  doc.setDrawColor(225);
  doc.line(15, 34, 195, 34);

  doc.setDrawColor(215);

  doc.roundedRect(15, 38, 180, 72, 3, 3);

  if (report.charts.envChartImage) {
    console.log(report.charts.envChartImage)
    doc.addImage(report.charts.envChartImage, "PNG", 18, 41, 174, 66);
  }

  doc.setFont("times", "bold");
  doc.setFontSize(13);

  doc.text("Generation & Savings Forecast", 15, 124);

  doc.setDrawColor(225);
  doc.line(15, 126, 195, 126);

  doc.setDrawColor(215);

  doc.roundedRect(15, 130, 180, 72, 3, 3);

  if (report.charts.dashboardChartImage) {
    doc.addImage(report.charts.dashboardChartImage, "PNG", 18, 133, 174, 66)
  }

  doc.setDrawColor(220);
  
  doc.line(SPACING.margin, pageHeight-10, pageWidth-SPACING.margin, pageHeight-10);

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(r_gray, g_gray, b_gray);

  doc.text("IRADe Rooftop Solar Calculator", centerX, pageHeight-5, { align: "center" });

}