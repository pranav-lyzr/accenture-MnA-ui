import { useToast } from "../hooks/use-toast";
import Layout from "../components/layout/Layout";
import { FileText, Download, File } from "lucide-react";
import { Button } from "../components/botton";
import * as XLSX from "xlsx";
import PptxGenJS from "pptxgenjs";

const STORAGE_KEYS = ["accenture-merger-results", "accenture-search-results"];

const reportTypes = [
  {
    title: "Companies List (Excel)",
    description: "Detailed list of all identified companies with tiering",
    format: "XLSX",
    icon: <File size={32} className="text-purple-500" />,
    handler: "downloadExcel",
  },
  {
    title: "Merger Analysis Summary (PPT)",
    description:
      "Summary of scan brief, recommended shortlist, and company details",
    format: "PPTX",
    icon: <FileText size={32} className="text-purple-500" />,
    handler: "downloadPPT",
  },
];

const Reports = () => {
  const { toast } = useToast();

  // Helper function to merge company data
  const mergeCompanyData = (companies: any[]): any[] => {
    const companyMap = new Map<string, any>();
    companies.forEach((company) => {
      const key =
        company.name?.toLowerCase() || company.domain_name?.toLowerCase();
      if (!key) return;
      if (!companyMap.has(key)) {
        companyMap.set(key, { ...company });
      } else {
        const existing = companyMap.get(key)!;
        Object.keys(company).forEach((field) => {
          if (Array.isArray(company[field]) && Array.isArray(existing[field])) {
            existing[field] = Array.from(
              new Set([...existing[field], ...company[field]])
            );
          } else if (Array.isArray(company[field])) {
            existing[field] = company[field];
          } else if (
            typeof company[field] === "string" &&
            company[field] &&
            (!existing[field] || company[field].length > existing[field].length)
          ) {
            existing[field] = company[field];
          } else if (company[field] && !existing[field]) {
            existing[field] = company[field];
          }
        });
      }
    });
    return Array.from(companyMap.values());
  };

  // Helper function to get tier based on overall_score
  const getTier = (score: number | undefined): string => {
    if (score === undefined) return "N/A";
    if (score > 85) return "Tier 1";
    if (score >= 80) return "Tier 2";
    return "Tier 3";
  };

  // Excel generation
  const generateExcel = () => {
    try {
      const allCompanies: any[] = [];
      let rankings: any[] = [];
      STORAGE_KEYS.forEach((key) => {
        const savedResults = localStorage.getItem(key);
        if (!savedResults) return;
        const data = JSON.parse(savedResults);
        if (key === "accenture-merger-results") {
          allCompanies.push(
            ...(data?.results?.["Initial Target Identification"]
              ?.raw_response || [])
          );
          rankings = data?.results?.claude_analysis?.rankings || [];
        } else if (key === "accenture-search-results") {
          allCompanies.push(...(data?.["0"]?.response || []));
          allCompanies.push(...(data?.["1"]?.response || []));
          allCompanies.push(...(data?.["2"]?.response || []));
        }
      });
      if (!allCompanies.length)
        throw new Error("No company data found in localStorage");
      const mergedCompanies = mergeCompanyData(allCompanies);
      const arrayToString = (arr: any, separator = ", ") =>
        Array.isArray(arr) ? arr.join(separator) : arr || "N/A";
      const excelData = mergedCompanies.map((company) => {
        // const ranking = rankings.find((r: any) => r.name === company.name);
        return {
          Name: company.name || "N/A",
          DomainName: company.domain_name || "N/A",
          EstimatedRevenue: company.estimated_revenue || "N/A",
          RevenueGrowth: company.revenue_growth || "N/A",
          EmployeeCount: company.employee_count || "N/A",
          KeyClients: arrayToString(company.key_clients),
          Leadership:
            company.leadership
              ?.map((l: any) => `${l.name} (${l.title})`)
              .join(", ") || "N/A",
          MergerSynergies: company.merger_synergies || "N/A",
          Industries: arrayToString(company.Industries),
          Services: arrayToString(company.Services),
          BroadCategory:
            company["Broad Category"] || company.Broad_Category || "N/A",
          Ownership: company.Ownership || "N/A",
          Sources: arrayToString(company.sources, "; "),
          OfficeLocations: arrayToString(company.office_locations),
          ValidationWarnings: arrayToString(company.validation_warnings, "; "),
        };
      });
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Companies");
      const colWidths = Object.keys(excelData[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...excelData.map((row: any) => String(row[key]).length)
        ),
      }));
      ws["!cols"] = colWidths;
      XLSX.writeFile(wb, "Companies_List.xlsx");
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({
        title: "Error",
        description: "Failed to generate Excel report",
        variant: "destructive",
      });
    }
  };

  // PPT generation
  const generatePPT = () => {
    try {
      const mergerResults = localStorage.getItem("accenture-merger-results");
      if (!mergerResults)
        throw new Error("No merger results found in localStorage");
      const mergerData = JSON.parse(mergerResults);
      const rankings = mergerData?.results?.claude_analysis?.rankings || [];
      const recommendations =
        mergerData?.results?.claude_analysis?.recommendations || [];
      const summary =
        mergerData?.results?.claude_analysis?.summary || "No summary available";

      let allCompanies = [];
      STORAGE_KEYS.forEach((key) => {
        const savedResults = localStorage.getItem(key);
        if (!savedResults) return;
        const data = JSON.parse(savedResults);
        if (key === "accenture-merger-results") {
          allCompanies.push(
            ...(data?.results?.["Initial Target Identification"]
              ?.raw_response || [])
          );
        } else if (key === "accenture-search-results") {
          allCompanies.push(...(data?.["0"]?.response || []));
          allCompanies.push(...(data?.["1"]?.response || []));
          allCompanies.push(...(data?.["2"]?.response || []));
        }
      });
      const uniqueCompanies = mergeCompanyData(allCompanies);
      const totalCompanies = uniqueCompanies.length;

      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: "A4", width: 10, height: 7.5 });

      // Slide 1: Title
      let slide = pptx.addSlide();
      slide.addText("Merger Analysis Summary", {
        x: 0.5,
        y: 2.5,
        w: 9.0,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: "#1E3A8A",
        align: "center",
      });
      slide.addText("Prepared for Accenture", {
        x: 0.5,
        y: 3.5,
        w: 9.0,
        h: 0.5,
        fontSize: 16,
        color: "#666666",
        align: "center",
      });

      // Slide 2: Scan Brief
      slide = pptx.addSlide();
      slide.addText("Scan Brief", {
        x: 0.5,
        y: 0.5,
        w: 9.0,
        h: 0.5,
        fontSize: 24,
        bold: true,
        color: "#1E3A8A",
      });
      slide.addText(
        `• Objective: Identify potential merger candidates in retail consulting, focusing on sourcing, product development, and supply chain
• Methodology: AI-driven market scan, data validation, and expert analysis  
• Scope: Enterprise retail consulting firms in North America
• Total Companies Identified: ${totalCompanies}`,
        {
          x: 0.5,
          y: 1.2,
          w: 9.0,
          h: 4.0,
          fontSize: 14,
          color: "#333333",
          wrap: true,
          lineSpacing: 24,
        }
      );

      // Slide 3: Recommended Shortlist
      slide = pptx.addSlide();
      slide.addText("Recommended Shortlist", {
        x: 0.5,
        y: 0.5,
        w: 9.0,
        h: 0.5,
        fontSize: 24,
        bold: true,
        color: "#1E3A8A",
      });
      const topCandidates = rankings.slice(0, 3);
      topCandidates.forEach((candidate, index) => {
        const recommendation = recommendations.find(
          (rec) => rec.name === candidate.name
        );
        slide.addText(
          `${index + 1}. ${candidate.name}
Overall Score: ${candidate.overall_score}
Rationale: ${candidate.rationale}
${
  recommendation
    ? `Key Synergies: ${recommendation.key_synergies.join(", ")}`
    : ""
}`,
          {
            x: 0.5,
            y: 1.2 + index * 1.8,
            w: 9.0,
            h: 1.5,
            fontSize: 12,
            color: "#333333",
            wrap: true,
            lineSpacing: 18,
          }
        );
      });

      // Company Detail Slides - Compact layout matching template exactly
      uniqueCompanies.forEach((company) => {
        slide = pptx.addSlide();

        // Purple header background - shorter height
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 10,
          h: 0.7,
          fill: { color: "4C2C85" },
        });

        // Header text - adjusted for shorter header
        slide.addText(
          company["Broad Category"] ||
            company.Broad_Category ||
            "Retail Consulting",
          {
            x: 0.1,
            y: 0.05,
            w: 8,
            h: 0.2,
            fontSize: 12,
            color: "FFFFFF",
          }
        );

        slide.addText(company.name || "COMPANY NAME", {
          x: 0.1,
          y: 0.25,
          w: 8,
          h: 0.4,
          fontSize: 24,
          color: "FFFFFF",
          bold: true,
        });

        // Helper function to clean and format leadership data
        const formatLeadership = (leadership) => {
          if (!Array.isArray(leadership))
            return "Leadership information not available";

          // Remove duplicates and format properly
          const uniqueLeaders = leadership.reduce((acc, leader) => {
            const key = `${leader.name}_${leader.title}`;
            if (!acc.has(key)) {
              acc.set(key, leader);
            }
            return acc;
          }, new Map());

          return Array.from(uniqueLeaders.values())
            .map((l) => `${l.title || "Executive"}: ${l.name}`)
            .join("\n");
        };

        // First row of boxes - tighter spacing
        const firstRowBoxes = [
          {
            title: "DETAILS",
            x: 0.05,
            content: [
              `HQ: ${
                Array.isArray(company.office_locations)
                  ? company.office_locations[0]
                  : company.office_locations || "N/A"
              }`,
              `Ownership: ${company.Ownership || "Private"}`,
              `Employees: ${company.employee_count || "N/A"}`,
              `Revenue: ${company.estimated_revenue || "N/A"}`,
              `Growth: ${company.revenue_growth || "N/A"}`,
            ]
              .filter((item) => item && !item.includes("N/A"))
              .join("\n"),
          },
          {
            title: "BUSINESS OVERVIEW",
            x: 3.35,
            content:
              company.merger_synergies ||
              "Specialized consulting firm focused on retail industry solutions",
          },
          {
            title: "SERVICE OFFERINGS",
            x: 6.65,
            content: Array.isArray(company.Services)
              ? company.Services.join(", ")
              : company.Services || "Consulting Services",
          },
        ];

        firstRowBoxes.forEach((box) => {
          // Shorter purple header
          slide.addShape(pptx.ShapeType.rect, {
            x: box.x,
            y: 0.8,
            w: 3.25,
            h: 0.25,
            fill: { color: "4C2C85" },
          });

          slide.addText(box.title, {
            x: box.x + 0.05,
            y: 0.82,
            w: 3.15,
            h: 0.21,
            fontSize: 11,
            color: "FFFFFF",
            bold: true,
          });

          // Shorter content box
          slide.addShape(pptx.ShapeType.rect, {
            x: box.x,
            y: 1.05,
            w: 3.25,
            h: 1.1,
            fill: { color: "FFFFFF" },
            line: { color: "CCCCCC", width: 1 },
          });

          slide.addText(box.content, {
            x: box.x + 0.05,
            y: 1.1,
            w: 3.15,
            h: 1.0,
            fontSize: 10,
            color: "000000",
            wrap: true,
            lineSpacing: 12,
          });
        });

        // Second row of boxes
        const secondRowBoxes = [
          {
            title: "MANAGEMENT TEAM",
            x: 0.05,
            content: formatLeadership(company.leadership),
          },
          {
            title: "WEBSITE",
            x: 3.35,
            content: company.domain_name
              ? `www.${company.domain_name}`
              : "Website not available",
          },
          {
            title: "KEY CLIENTS",
            x: 6.65,
            content: Array.isArray(company.key_clients)
              ? company.key_clients.join("\n")
              : "Client information not available",
          },
        ];

        secondRowBoxes.forEach((box) => {
          // Shorter purple header
          slide.addShape(pptx.ShapeType.rect, {
            x: box.x,
            y: 2.25,
            w: 3.25,
            h: 0.25,
            fill: { color: "4C2C85" },
          });

          slide.addText(box.title, {
            x: box.x + 0.05,
            y: 2.27,
            w: 3.15,
            h: 0.21,
            fontSize: 11,
            color: "FFFFFF",
            bold: true,
          });

          // Shorter content box
          slide.addShape(pptx.ShapeType.rect, {
            x: box.x,
            y: 2.5,
            w: 3.25,
            h: 1.1,
            fill: { color: "FFFFFF" },
            line: { color: "CCCCCC", width: 1 },
          });

          slide.addText(box.content, {
            x: box.x + 0.05,
            y: 2.55,
            w: 3.15,
            h: 1.0,
            fontSize: 10,
            color: "000000",
            wrap: true,
            lineSpacing: 12,
          });
        });

        // Third row of boxes
        const thirdRowBoxes = [
          {
            title: "INDUSTRIES SERVED",
            x: 0.05,
            content: Array.isArray(company.Industries)
              ? company.Industries.join(", ")
              : company.Industries || "Retail, Consumer Goods",
          },
          {
            title: "GEOGRAPHIC PRESENCE",
            x: 3.35,
            content: Array.isArray(company.office_locations)
              ? company.office_locations.join(", ")
              : company.office_locations || "United States",
          },
          {
            title: "MERGER SYNERGIES",
            x: 6.65,
            content:
              company.merger_synergies ||
              "Strategic alignment opportunities to be evaluated",
          },
        ];

        thirdRowBoxes.forEach((box) => {
          // Shorter purple header
          slide.addShape(pptx.ShapeType.rect, {
            x: box.x,
            y: 3.7,
            w: 3.25,
            h: 0.25,
            fill: { color: "4C2C85" },
          });

          slide.addText(box.title, {
            x: box.x + 0.05,
            y: 3.72,
            w: 3.15,
            h: 0.21,
            fontSize: 11,
            color: "FFFFFF",
            bold: true,
          });

          // Shorter content box
          slide.addShape(pptx.ShapeType.rect, {
            x: box.x,
            y: 3.95,
            w: 3.25,
            h: 1.1,
            fill: { color: "FFFFFF" },
            line: { color: "CCCCCC", width: 1 },
          });

          slide.addText(box.content, {
            x: box.x + 0.05,
            y: 4.0,
            w: 3.15,
            h: 1.0,
            fontSize: 10,
            color: "000000",
            wrap: true,
            lineSpacing: 12,
          });
        });

        // Compact footer
        slide.addText(
          "* Financial information based on publicly available sources - to be verified with management at a later stage",
          {
            x: 0.05,
            y: 5.2,
            w: 7,
            h: 0.2,
            fontSize: 8,
            color: "666666",
            italic: true,
          }
        );

        slide.addText(
          "Source: Company website, LinkedIn, Capital IQ, Pitchbook",
          {
            x: 0.05,
            y: 5.45,
            w: 5,
            h: 0.2,
            fontSize: 8,
            color: "666666",
          }
        );

        slide.addText("Copyright © 2025 Accenture. All rights reserved.", {
          x: 5.5,
          y: 5.45,
          w: 4.45,
          h: 0.2,
          fontSize: 8,
          color: "666666",
          align: "right",
        });
      });

      pptx.writeFile({ fileName: "Merger_Analysis_Summary.pptx" });
    } catch (error) {
      console.error("Error generating PPT:", error);
      toast({
        title: "Error",
        description: "Failed to generate PPT report",
        variant: "destructive",
      });
    }
  };
  const handleDownload = (handler: string) => {
    if (handler === "downloadExcel") generateExcel();
    else if (handler === "downloadPPT") generatePPT();
    toast({
      title: "Download Started",
      description: "Your report is being downloaded",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-500">Download and export analysis reports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
          >
            <div className="p-6">
              <div className="flex items-start">
                {report.icon}
                <div className="ml-4">
                  <h3 className="text-lg font-bold">{report.title}</h3>
                  <p className="text-gray-500 mt-1">{report.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Format: {report.format}
                    </span>
                    <Button
                      onClick={() => handleDownload(report.handler)}
                      className="bg-purple-500 hover:bg-purple-600 flex items-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Reports;
