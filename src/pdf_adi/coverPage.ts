import jsPDF from "jspdf";
import { SolarReportTypes } from "./types/report";
import { COLORS } from "./helper/theme";
import { formatLatitude, formatLongitude, loadImage } from "./helper/helperFunctions";


export async function CoverPage(doc: jsPDF, report: SolarReportTypes) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const centerX = pageWidth / 2;

  const logo = await loadImage("/IRADe_full_logo.jpeg");

  
  const [r_primary, g_primary, b_primary] = COLORS.primary;
  const [r_title,g_title,b_title] = COLORS.white;
  const [r_light, g_light, b_light] = COLORS.light;
  const [r_sec, g_sec, b_sec] = COLORS.secondary;
  const [r_black, g_black, b_black] = COLORS.black;
  const [r_gray, g_gray, b_gray] = COLORS.gray;
  
  doc.addImage(logo, "JPEG", centerX-42, 18, 84, 28);
  
  // TITLE
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(r_black, g_black, b_black);

  doc.text("SOLAR FEASIBILITY REPORT", centerX, 70, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(15);

  doc.text("FOR ROOFTOP SOLAR PV", centerX, 80, { align: "center" });
  
  // LOCATION
  doc.setFont("times", "bold");
  doc.setFontSize(16);

  doc.text("PROJECT LOCATION: ", centerX, 98, { align: "center" });
  
  doc.setFont("times", "bold");
  doc.setFontSize(18);

  doc.text(report.project.location, centerX, 112, { align: "center" });

  // COORDINATES
  doc.setFont("times", "normal");
  doc.setFontSize(13);

  doc.text(`Latitude : ${formatLatitude(report.project.lat)}`, centerX, 130, { align: "center" });

  doc.text(`Longitude : ${formatLongitude(report.project.long)}`, centerX, 140, { align: "center" });

  // PREPARED BY
  doc.setFont("times", "italic");
  doc.setFontSize(13);

  doc.text("Prepared by ", centerX, 165, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(15);

  doc.text("IRADe Rooftop Solar Calculator", centerX, 176, { align: "center" });

  // DISCLAIMER

  doc.setFont("times", "normal");
  doc.setFontSize(12);

  const disclaimer = [
    "This report presents a preliminary technical and financial",
    "assessment of rooftop solar photovoltaic potential based",
    "on the project location and the inputs provided by the user.",
  ]

  doc.text(disclaimer, centerX, 205, { align: "center" });

  // REPORT DETAILS
  doc.setFont("times", "normal");
  doc.setFontSize(13);

  doc.text("Report Date", centerX, 240, { align: "center" });

  doc.setFont("times", "bold");

  doc.text(new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }), centerX, 250, { align: "center" });


  // ORGANIZATION
  doc.setFont("times", "bold");
  doc.setFontSize(12);

  doc.text("INTEGRATED RESEARCH AND ACTION FOR DEVELOPMENT (IRADe)", centerX, 278, { align: "center" });
  

  // FOOTER
  doc.setFont("times", "normal");
  doc.setFontSize(10);

  doc.setTextColor(r_gray, g_gray, b_gray);

  doc.text("© 2026 IRADe. All rights reserved.", centerX, pageHeight-10, { align: "center" });
}