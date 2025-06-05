import { useState, useEffect } from 'react';
import { useToast } from "../hooks/use-toast";
import Layout from "../components/layout/Layout";
import { FileText, Download, File } from "lucide-react";
import { Button } from "../components/botton";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import * as XLSX from "xlsx";
import PptxGenJS from "pptxgenjs";
import api from '../services/api';

interface CompanyData {
  _id: string;
  name: string;
  "Broad Category": string;
  Industries: string[];
  Ownership: string;
  Services: string[];
  domain_name: string;
  employee_count: string;
  estimated_revenue: string;
  key_clients: string[];
  leadership: { name: string; title: string }[];
  merger_synergies: string;
  office_locations: string[];
  revenue_growth: string;
  sources: string[];
  validation_warnings: string[];
}

const reportTypes = [
  {
    title: "Companies List (Excel)",
    description: "Comprehensive database of all identified companies with detailed analysis",
    format: "XLSX",
    icon: <File size={32} className="text-emerald-600" />,
    handler: "downloadExcel",
    color: "emerald",
  },
  {
    title: "Merger Analysis Summary (PPT)",
    description: "Executive presentation with scan brief and detailed company profiles",
    format: "PPTX", 
    icon: <FileText size={32} className="text-blue-600" />,
    handler: "downloadPPT",
    color: "blue",
  },
];

const Reports = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await api.getCompanies();
        setCompanies(data as CompanyData[]);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Error",
          description: "Failed to load company data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, [toast]);

  const generateExcel = () => {
    if (isLoading) {
      toast({
        title: "Loading",
        description: "Please wait while data is loading",
      });
      return;
    }
    if (!companies.length) {
      toast({
        title: "Error",
        description: "No company data available",
        variant: "destructive",
      });
      return;
    }
    try {
      const excelData = companies.map(company => ({
        Name: company.name || "N/A",
        DomainName: company.domain_name || "N/A",
        EstimatedRevenue: company.estimated_revenue || "N/A",
        RevenueGrowth: company.revenue_growth || "N/A",
        EmployeeCount: company.employee_count || "N/A",
        KeyClients: Array.isArray(company.key_clients) ? company.key_clients.join(", ") : "N/A",
        Leadership: Array.isArray(company.leadership) ? company.leadership.map(l => `${l.name} (${l.title})`).join(", ") : "N/A",
        MergerSynergies: company.merger_synergies || "N/A",
        Industries: company.Industries
          ? (Array.isArray(company.Industries)
            ? company.Industries.join(", ")
            : String(company.Industries))
          : "N/A",
        Services: company.Services
          ? (Array.isArray(company.Services)
            ? company.Services.join(", ")
            : String(company.Services))
          : "N/A",
        BroadCategory: company["Broad Category"] || "N/A",
        Ownership: company.Ownership || "N/A",
        Sources: Array.isArray(company.sources) ? company.sources.join("; ") : "N/A",
        OfficeLocations: Array.isArray(company.office_locations) ? company.office_locations.join(", ") : "N/A",
        ValidationWarnings: Array.isArray(company.validation_warnings) ? company.validation_warnings.join("; ") : "N/A",
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Companies");
      const colWidths = Object.keys(excelData[0]).map(key => ({
        wch: Math.max(key.length, ...excelData.map(row => String(row[key as keyof typeof excelData[number]]).length))
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

  const generatePPT = () => {
    if (isLoading) {
      toast({
        title: "Loading",
        description: "Please wait while data is loading",
      });
      return;
    }
    if (!companies.length) {
      toast({
        title: "Error",
        description: "No company data available",
        variant: "destructive",
      });
      return;
    }
    try {
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
• Total Companies Identified: ${companies.length}`,
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

      // Company Detail Slides
      companies.forEach(company => {
        slide = pptx.addSlide();

        // Purple header background
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 10,
          h: 0.7,
          fill: { color: "4C2C85" },
        });

        // Header text
        slide.addText(
          company["Broad Category"] || "Retail Consulting",
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

        // First row of boxes
        const firstRowBoxes = [
          {
            title: "DETAILS",
            x: 0.05,
            content: [
              `HQ: ${Array.isArray(company.office_locations) ? company.office_locations[0] : company.office_locations || "N/A"}`,
              `Ownership: ${company.Ownership || "N/A"}`,
              `Employees: ${company.employee_count || "N/A"}`,
              `Revenue: ${company.estimated_revenue || "N/A"}`,
              `Growth: ${company.revenue_growth || "N/A"}`,
            ].filter(item => item && !item.includes("N/A")).join("\n"),
          },
          {
            title: "BUSINESS OVERVIEW",
            x: 3.35,
            content: company.merger_synergies || "Specialized consulting firm focused on retail industry solutions",
          },
          {
            title: "SERVICE OFFERINGS",
            x: 6.65,
            content: Array.isArray(company.Services) ? company.Services.join(", ") : company.Services || "N/A",
          },
        ];

        firstRowBoxes.forEach(box => {
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
            content: Array.isArray(company.leadership) ? company.leadership.map(l => `${l.title || "Executive"}: ${l.name}`).join("\n") : "Leadership information not available",
          },
          {
            title: "WEBSITE",
            x: 3.35,
            content: company.domain_name ? `www.${company.domain_name}` : "Website not available",
          },
          {
            title: "KEY CLIENTS",
            x: 6.65,
            content: Array.isArray(company.key_clients) ? company.key_clients.join("\n") : "Client information not available",
          },
        ];

        secondRowBoxes.forEach(box => {
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
            content: Array.isArray(company.Industries) ? company.Industries.join(", ") : company.Industries || "Retail, Consumer Goods",
          },
          {
            title: "GEOGRAPHIC PRESENCE",
            x: 3.35,
            content: Array.isArray(company.office_locations) ? company.office_locations.join(", ") : company.office_locations || "United States",
          },
          {
            title: "MERGER SYNERGIES",
            x: 6.65,
            content: company.merger_synergies || "Strategic alignment opportunities to be evaluated",
          },
        ];

        thirdRowBoxes.forEach(box => {
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

        // Footer
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
      description: "Your report is being generated and will download shortly",
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        button: "bg-emerald-600 hover:bg-emerald-700",
        text: "text-emerald-700"
      },
      blue: {
        bg: "bg-blue-50", 
        border: "border-blue-200",
        button: "bg-blue-600 hover:bg-blue-700",
        text: "text-blue-700"
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.emerald;
  };

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600 text-lg">Download comprehensive analysis reports and export data</p>
          </div>
          
          {!isLoading && (
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{companies.length}</div>
              <div className="text-sm text-gray-500 font-medium">Companies Analyzed</div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-opacity-25 border-t-purple-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading company data...</p>
            <p className="text-gray-500">Preparing your reports</p>
          </div>
        </div>
      ) : (
        /* Report Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {reportTypes.map((report, index) => {
            const colors = getColorClasses(report.color);
            return (
              <Card key={index} className={`transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colors.border} overflow-hidden`}>
                <CardHeader className={`${colors.bg} ${colors.border} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        {report.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {report.title}
                        </CardTitle>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} mt-2`}>
                          {report.format} Format
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <br />
                  <Button
                    onClick={() => handleDownload(report.handler)}
                    className={`w-full ${colors.button} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg`}
                    disabled={isLoading || companies.length === 0}
                  >
                    <Download size={20} />
                    <span>Download {report.format}</span>
                  </Button>
                  
                  {companies.length === 0 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      No data available for download
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      
    </Layout>
  );
};

export default Reports;