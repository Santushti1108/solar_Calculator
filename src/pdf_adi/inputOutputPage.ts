import jsPDF from "jspdf";
import { SolarReportTypes } from "./types/report";
import { COLORS, SPACING } from "./helper/theme";
import autoTable from "jspdf-autotable";

export function systemSummary(doc: jsPDF, report: SolarReportTypes) {
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

  doc.text("SYSTEM INPUTS & OUTPUTS", centerX, 18, { align: "center" });

  autoTable(doc, {
    startY: 28,
    head: [["SYSTEM CONFIGURATION", ""]],
    body: [
    ["System Type", report.system.systemType],
    ["Configuration", report.system.configuration],
    ],

    theme: 'grid',

    headStyles: {
      fillColor: [245, 245, 245],
      textColor: 0,
      fontStyle: "bold",
      halign: "left",
      font: "times",
      fontSize: 10,
      cellPadding: 2
    },

    bodyStyles: {
      font: "times",
      fontSize: 10,
      cellPadding: 2,
      minCellHeight: 6
    },

    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 80,
      }
    }
  });


  // CAPEX

  const capexRows: (string | number)[][] = [
    [
      "Solar PV unit cost",
      `Rs. ${report.capex.solarPVUnitCost.toLocaleString()} / kWp`
    ],
    [
      "BESS Unit cost",
      `Rs. ${report.capex.bessUnitCost.toLocaleString()} / kWh`
    ],
    [
      "Inverter Unit Cost",
      `Rs. ${report.capex.inverterUnitCost.toLocaleString()} / kW`
    ],
    [
      "Government Subsidy",
      report.capex.includeGovernmentSubsidy
      ? "Included"
      : "Not Included"
    ],
    [
      "External Financing",
      report.capex.externalFinancing
      ? "Enabled"
      : "Disabled"
    ]
  ];

  if (report.capex.externalFinancing) {
    capexRows.push(
      [
        "Loan % of Total CAPEX",
        `${report.capex.loanPercent}%`
      ],
      [
        "Loan interest Rate",
        `${report.capex.loanInterestRate}%`
      ],
      [
        "Loan tenure",
        `${report.capex.loanTenure} Years`
      ]
    );
  }

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 4,

    head: [["CAPEX ASSUMPTION", ""]],

    body: capexRows,

    theme: "grid",

    headStyles: {
      fillColor: [245, 245, 245],
      textColor: 0,
      fontStyle: "bold",
      halign: "left",
      font: "times",
      fontSize: 10,
      cellPadding: 2
    },

    bodyStyles: {
      font: "times",
      fontSize: 10,
      cellPadding: 2,
      minCellHeight: 6
    },

    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 80,
      },
    }
  });

  // SYSTEM PERFORMANCE
  const outputY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(r_black, g_black, b_black);

  doc.text("SYSTEM PERFORMANCE", 14, outputY);
  
  const cardHeight = 16;
  const cardWidth = 82;

  const leftX = 20;
  const rightX = 110;

  const gapY = 20;

  const cards = [
    {
      label: "Solar Size",
      value: `${report.outputs.solarSize} kWp`
    },
    {
      label: "Panel Count",
      value: `${report.outputs.panelCount} panels`
    },
    {
      label: "Battery Size",
      value: `${report.outputs.batterySize} kWh`
    },
    {
      label: "NET Capex",
      value: `Rs. ${report.outputs.netCapex} lakh`
    },
    {
      label: "Annual Savings",
      value: `Rs. ${report.outputs.annualSaving} lakh / yr`
    },
    {
      label: "Payback",
      value: `${report.outputs.payback} years`
    },
    {
      label: "NPV",
      value: `Rs. ${report.outputs.npv} lakh`
    },
    {
      label: "IRR",
      value: `${report.outputs.irr}%`
    },
    {
      label: "CO2 Offset",
      value: `${report.outputs.co2Offset} tonnes`
    },
    {
      label: "LCOE",
      value: `${report.outputs.lcoe} Rs. / kWh`
    },
    {
      label: "Year-1 Gen",
      value: `${report.outputs.firstYrGeneration} MWh / yr`
    }
  ]

  cards.forEach((card, idx) => {
    const column = idx % 2;
    const row = Math.floor(idx / 2);

    const x = column === 0 ? leftX : rightX;
    const y = outputY + 6 + row * gapY;

    // doc.setFillColor(248, 248, 248);

    // doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "F");

    doc.setDrawColor(215);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "S")

    const centerX = x+cardWidth/2;

    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.setTextColor(r_gray, g_gray, b_gray);

    doc.text(card.label, centerX, y+5, { align: "center", baseline: "middle" });

    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(r_black, g_black, b_black);

    doc.text(card.value, centerX, y+11.5, { align: "center", baseline: "middle" });
  });


  // FOOTER
  doc.setDrawColor(220);

  doc.line(SPACING.margin, pageHeight-10, pageWidth-SPACING.margin, pageHeight-10);

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(r_gray, g_gray, b_gray);

  doc.text("IRADe Rooftop Solar Calculator", centerX, pageHeight-5, { align: "center" });
}