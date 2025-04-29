import { useToast } from "../hooks/use-toast";
import Layout from '../components/layout/Layout';
import { FileText, Download, File } from 'lucide-react';
import { Button } from '../components/botton';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';

const STORAGE_KEYS = ['accenture-merger-results', 'accenture-search-results'];

const reportTypes = [
  {
    title: 'Companies List (Excel)',
    description: 'Detailed list of all identified companies with tiering',
    format: 'XLSX',
    icon: <File size={32} className="text-purple-500" />,
    handler: 'downloadExcel'
  },
  {
    title: 'Merger Analysis Summary (PPT)',
    description: 'Summary of scan brief, recommended shortlist, and company details',
    format: 'PPTX',
    icon: <FileText size={32} className="text-purple-500" />,
    handler: 'downloadPPT'
  }
];

const Reports = () => {
  const { toast } = useToast();

  // Helper function to merge company data
  const mergeCompanyData = (companies: any[]): any[] => {
    const companyMap = new Map<string, any>();
    companies.forEach((company) => {
      const key = company.name?.toLowerCase() || company.domain_name?.toLowerCase();
      if (!key) return;
      if (!companyMap.has(key)) {
        companyMap.set(key, { ...company });
      } else {
        const existing = companyMap.get(key)!;
        Object.keys(company).forEach((field) => {
          if (Array.isArray(company[field]) && Array.isArray(existing[field])) {
            existing[field] = Array.from(new Set([...existing[field], ...company[field]]));
          } else if (Array.isArray(company[field])) {
            existing[field] = company[field];
          } else if (typeof company[field] === 'string' && company[field] && (!existing[field] || company[field].length > existing[field].length)) {
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
    if (score === undefined) return 'N/A';
    if (score > 85) return 'Tier 1';
    if (score >= 80) return 'Tier 2';
    return 'Tier 3';
  };

  // Excel generation
  const generateExcel = () => {
    try {
      let allCompanies: any[] = [];
      let rankings: any[] = [];
      STORAGE_KEYS.forEach((key) => {
        const savedResults = localStorage.getItem(key);
        if (!savedResults) return;
        const data = JSON.parse(savedResults);
        if (key === 'accenture-merger-results') {
          allCompanies.push(...(data?.results?.['Initial Target Identification']?.raw_response || []));
          rankings = data?.results?.claude_analysis?.rankings || [];
        } else if (key === 'accenture-search-results') {
          allCompanies.push(...(data?.['0']?.response || []));
          allCompanies.push(...(data?.['1']?.response || []));
          allCompanies.push(...(data?.['2']?.response || []));
        }
      });
      if (!allCompanies.length) throw new Error('No company data found in localStorage');
      const mergedCompanies = mergeCompanyData(allCompanies);
      const excelData = mergedCompanies.map((company) => {
        const ranking = rankings.find((r: any) => r.name === company.name);
        return {
          Name: company.name || 'N/A',
          Domain: company.domain_name || 'N/A',
          Tier: getTier(ranking?.overall_score),
          EstimatedRevenue: company.estimated_revenue || 'N/A',
          RevenueGrowth: company.revenue_growth || 'N/A',
          Profitability: company.profitability || 'N/A',
          ValuationEstimate: company.valuation_estimate || 'N/A',
          EmployeeCount: company.employee_count || 'N/A',
          OfficeLocations: company.office_locations?.join(', ') || 'N/A',
          KeyClients: company.key_clients?.join(', ') || 'N/A',
          AverageContractValue: company.average_contract_value || 'N/A',
          Leadership: company.leadership?.map((l: any) => `${l.name} (${l.title})`).join(', ') || 'N/A',
          PrimaryDomains: company.primary_domains?.join(', ') || 'N/A',
          ProprietaryMethodologies: company.proprietary_methodologies || 'N/A',
          TechnologyTools: company.technology_tools?.join(', ') || 'N/A',
          CompetitiveAdvantage: company.competitive_advantage || 'N/A',
          MergerSynergies: company.merger_synergies || 'N/A',
          CulturalAlignment: company.cultural_alignment || 'N/A',
          IntegrationChallenges: company.integration_challenges || 'N/A',
          MarketPenetration: company.market_penetration || 'N/A',
          Sources: company.sources?.join(', ') || 'N/A',
          ValidationWarnings: company.validation_warnings?.join('; ') || 'N/A',
          TechnologicalEnablementScore: company.technological_enablement_score || 'N/A',
          GlobalSourcingReach: company.global_sourcing_reach || 'N/A'
        };
      });
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Companies');
      const colWidths = Object.keys(excelData[0]).map((key) => ({
        wch: Math.max(key.length, ...excelData.map((row: any) => String(row[key]).length))
      }));
      ws['!cols'] = colWidths;
      XLSX.writeFile(wb, 'Companies_List.xlsx');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast({ title: "Error", description: "Failed to generate Excel report", variant: "destructive" });
    }
  };

  // PPT generation
  const generatePPT = () => {
    try {
      const mergerResults = localStorage.getItem('accenture-merger-results');
      if (!mergerResults) throw new Error('No merger results found in localStorage');
      const mergerData = JSON.parse(mergerResults);
      const rankings = mergerData?.results?.claude_analysis?.rankings || [];
      const recommendations = mergerData?.results?.claude_analysis?.recommendations || [];
      const summary = mergerData?.results?.claude_analysis?.summary || 'No summary available';

      let allCompanies: any[] = [];
      STORAGE_KEYS.forEach((key) => {
        const savedResults = localStorage.getItem(key);
        if (!savedResults) return;
        const data = JSON.parse(savedResults);
        if (key === 'accenture-merger-results') {
          allCompanies.push(...(data?.results?.['Initial Target Identification']?.raw_response || []));
        } else if (key === 'accenture-search-results') {
          allCompanies.push(...(data?.['0']?.response || []));
          allCompanies.push(...(data?.['1']?.response || []));
          allCompanies.push(...(data?.['2']?.response || []));
        }
      });
      const uniqueCompanies = mergeCompanyData(allCompanies);
      const totalCompanies = uniqueCompanies.length;

      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: 'A4', width: 10, height: 7.5 });

      // Slide 1: Title
      let slide = pptx.addSlide();
      slide.addText('Merger Analysis Summary', { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 14, bold: true, color: '#1E3A8A', align: 'center' });
      slide.addText('Prepared for Accenture', { x: 0.5, y: 1.0, w: 9.0, h: 0.3, fontSize: 9, color: '#1E3A8A', align: 'center' });

      // Slide 2: Scan Brief
      slide = pptx.addSlide();
      slide.addText('Scan Brief', { x: 0.5, y: 0.5, w: 9.0, h: 0.3, fontSize: 12, bold: true, color: '#1E3A8A' });
      slide.addText(
        'Objective: Identify potential merger candidates in retail consulting, focusing on sourcing, product development, and supply chain.\n' +
        'Methodology: AI-driven market scan, data validation, and expert analysis.\n' +
        'Scope: Enterprise retail consulting firms in North America.\n' +
        `Total Companies Identified: ${totalCompanies}`,
        { x: 0.5, y: 0.9, w: 9.0, h: 3.0, fontSize: 8, color: '#333333', wrap: true }
      );

      // Slide 3: Recommended Shortlist
      slide = pptx.addSlide();
      slide.addText('Recommended Shortlist', { x: 0.5, y: 0.5, w: 9.0, h: 0.3, fontSize: 12, bold: true, color: '#1E3A8A' });
      const topCandidates = rankings.slice(0, 3);
      topCandidates.forEach((candidate: any, index: number) => {
        const recommendation = recommendations.find((rec: any) => rec.name === candidate.name);
        slide.addText(
          `${index + 1}. ${candidate.name}\n` +
          `Overall Score: ${candidate.overall_score}\n` +
          `Rationale: ${candidate.rationale}\n` +
          (recommendation
            ? `Key Synergies: ${recommendation.key_synergies.join(', ')}\n` +
              `Merger Potential: ${recommendation.merger_potential}`
            : 'No additional recommendations available'),
          { x: 0.5, y: 0.9 + index * 0.8, w: 9.0, h: 0.7, fontSize: 7, color: '#333333', wrap: true }
        );
      });

      // Slide 4: Process Status
      slide = pptx.addSlide();
      slide.addText('Overall Process Status', { x: 0.5, y: 0.5, w: 9.0, h: 0.3, fontSize: 12, bold: true, color: '#1E3A8A' });
      slide.addText(summary, { x: 0.5, y: 0.9, w: 9.0, h: 3.0, fontSize: 8, color: '#333333', wrap: true });

      // Slides 5+: Company Details
      uniqueCompanies.forEach((company: any) => {
        slide = pptx.addSlide();
        slide.addText(company.name || 'Unnamed Company', { x: 0.5, y: 0.2, w: 9.0, h: 0.5, fontSize: 14, bold: true, color: '#1E3A8A', align: 'left' });

        // Left Column (DETAILS, MANAGEMENT TEAM, CLIENTS, MERGER SYNERGIES, CULTURAL ALIGNMENT)
        let leftY = 0.7;
        const addLeftSection = (title: string, content: string, opts = {}) => {
          if (content && content !== 'N/A' && content !== 'undefined') {
            slide.addText(title, { x: 0.5, y: leftY, w: 4.5, h: 0.3, fontSize: 8, bold: true, color: '#1E3A8A', ...opts });
            slide.addText(content, { x: 0.5, y: leftY + 0.2, w: 4.5, h: 0.4, fontSize: 6, color: '#333333', wrap: true, ...opts });
            leftY += 0.6; // Reduced to 0.6 inches per section
          }
        };
        addLeftSection('DETAILS', [
          company.office_locations?.join(', ') || '',
          company.employee_count ? `${company.employee_count} Employees` : ''
        ].filter(Boolean).join('\n'));
        addLeftSection('MANAGEMENT TEAM', company.leadership?.map((l: any) => `${l.title}: ${l.name}`).join('\n') || '', { fill: { color: '#E5E7EB' } });
        addLeftSection('CLIENTS', company.key_clients?.join(', ') || '');
        addLeftSection('MERGER SYNERGIES', company.merger_synergies || '');
        addLeftSection('CULTURAL ALIGNMENT', company.cultural_alignment || '');

        // Right Column (BUSINESS OVERVIEW, SERVICE OFFERINGS, PARTNERS, INDUSTRIES, FINANCIALS, INTEGRATION CHALLENGES, MARKET PENETRATION, TECHNOLOGICAL ENABLEMENT SCORE, GLOBAL SOURCING REACH)
        let rightY = 0.7;
        const addRightSection = (title: string, content: string) => {
          if (content && content !== 'N/A' && content !== 'undefined') {
            slide.addText(title, { x: 5.5, y: rightY, w: 4.0, h: 0.3, fontSize: 8, bold: true, color: '#1E3A8A' });
            slide.addText(content, { x: 5.5, y: rightY + 0.2, w: 4.0, h: 0.4, fontSize: 6, color: '#333333', wrap: true });
            rightY += 0.6; // Reduced to 0.6 inches per section
          }
        };
        addRightSection('BUSINESS OVERVIEW', company.competitive_advantage || '');
        addRightSection('SERVICE OFFERINGS', company.proprietary_methodologies || company.primary_domains?.join(', ') || '');
        addRightSection('PARTNERS', company.technology_tools?.join(', ') || '');
        addRightSection('INDUSTRIES', company.primary_domains?.join(', ') || '');
        addRightSection('FINANCIALS', [
          company.estimated_revenue ? `Revenue: ${company.estimated_revenue}` : '',
          company.revenue_growth ? `3Y Revenue CAGR: ${company.revenue_growth}` : '',
          company.profitability ? `EBIT: ${company.profitability}` : '',
          company.valuation_estimate ? `Valuation: ${company.valuation_estimate}` : ''
        ].filter(Boolean).join('\n'));
        addRightSection('INTEGRATION CHALLENGES', company.integration_challenges || '');
        addRightSection('MARKET PENETRATION', company.market_penetration || '');
        addRightSection('TECHNOLOGICAL ENABLEMENT SCORE', company.technological_enablement_score ? `Score: ${company.technological_enablement_score}` : '');
        addRightSection('GLOBAL SOURCING REACH', company.global_sourcing_reach || '');

        // Footer
        slide.addText('* Information based on available sources - to be verified', { x: 0.5, y: 7.3, w: 9.0, h: 0.1, fontSize: 4, color: '#666666' });
        slide.addText('Source: Company data', { x: 0.5, y: 7.4, w: 9.0, h: 0.1, fontSize: 4, color: '#666666' });
        slide.addText('Copyright © 2025 Accenture. All rights reserved.', { x: 7.0, y: 7.4, w: 2.5, h: 0.1, fontSize: 4, color: '#666666', align: 'right' });
      });

      pptx.writeFile({ fileName: 'Merger_Analysis_Summary.pptx' });
    } catch (error) {
      console.error('Error generating PPT:', error);
      toast({ title: "Error", description: "Failed to generate PPT report", variant: "destructive" });
    }
  };

  const handleDownload = (handler: string) => {
    if (handler === 'downloadExcel') generateExcel();
    else if (handler === 'downloadPPT') generatePPT();
    toast({ title: "Download Started", description: "Your report is being downloaded" });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-500">Download and export analysis reports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
            <div className="p-6">
              <div className="flex items-start">
                {report.icon}
                <div className="ml-4">
                  <h3 className="text-lg font-bold">{report.title}</h3>
                  <p className="text-gray-500 mt-1">{report.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Format: {report.format}</span>
                    <Button onClick={() => handleDownload(report.handler)} className="bg-purple-500 hover:bg-purple-600 flex items-center space-x-2">
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