// components/analysis/AnalysisResults.tsx
import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '../../components/botton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import CompanyDetailsDialog from '../companies/CompanyDetailsDialog';
import * as XLSX from 'xlsx';

interface CompanyCardProps {
  name: string;
  domain_name?: string;
  office_locations?: string[];
  estimated_revenue?: string;
  revenue?: string;
  revenue_growth?: string;
  employee_count?: string;
  key_clients?: string[];
  leadership?: Array<{
    [key: string]: string;
  }>;
  merger_synergies?: string;
  Industries?: string | string[];
  Services?: string;
  Broad_Category?: string;
  Ownership?: string;
  sources?: string[];
  validation_warnings?: string[];
  status?: "shortlisted" | "rejected" | "pending";
}

interface AnalysisResult {
  rankings: Array<{
    name: string;
    overall_score: number;
    financial_health_score: number;
    strategic_fit_score: number;
    operational_compatibility_score: number;
    leadership_innovation_score: number;
    cultural_integration_score: number;
    rationale: string;
  }>;
  recommendations: Array<{
    name: string;
    merger_potential: string;
    key_synergies: string[];
    potential_risks: string[];
  }>;
  summary: string;
}

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  lastAnalysisTimestamp: string;
  onRefresh: () => void;
  companies: CompanyCardProps[]; // Added to access full company details
}

const AnalysisResults = ({ analysis, lastAnalysisTimestamp, onRefresh, companies }: AnalysisResultsProps) => {
  const [sortColumn, setSortColumn] = useState<string>('overall_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCompany, setSelectedCompany] = useState<CompanyCardProps | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const sortedRankings = [...analysis.rankings].sort((a, b) => {
    const valueA = a[sortColumn as keyof typeof a] as number;
    const valueB = b[sortColumn as keyof typeof b] as number;
    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const openCompanyDetails = (companyName: string) => {
    const fullCompanyDetails = companies.find(c => c.name === companyName);
    if (fullCompanyDetails) {
      setSelectedCompany(fullCompanyDetails);
      setOpenDialog(true);
    }
  };

  const handleDownloadAnalysis = () => {
    // Prepare data for Excel
    // Sheet 1: Rankings
    const rankingsSheetData = sortedRankings.map((company, index) => ({
      Rank: index + 1,
      'Company Name': company.name,
      'Overall Score': company.overall_score,
      'Financial Health': company.financial_health_score,
      'Strategic Fit': company.strategic_fit_score,
      'Operational Compatibility': company.operational_compatibility_score,
      'Leadership Innovation': company.leadership_innovation_score,
      'Cultural Integration': company.cultural_integration_score,
      Rationale: company.rationale,
    }));

    // Sheet 2: Recommendations
    const recommendationsSheetData = analysis.recommendations.map(rec => ({
      'Company Name': rec.name,
      'Merger Potential': rec.merger_potential,
      'Key Synergies': rec.key_synergies.join('; '),
      'Potential Risks': rec.potential_risks.join('; '),
    }));

    // Sheet 3: Summary
    const summarySheetData = [{ Summary: analysis.summary }];

    // Create workbook and worksheets
    const workbook = XLSX.utils.book_new();
    const rankingsWorksheet = XLSX.utils.json_to_sheet(rankingsSheetData);
    const recommendationsWorksheet = XLSX.utils.json_to_sheet(recommendationsSheetData);
    const summaryWorksheet = XLSX.utils.json_to_sheet(summarySheetData);

    // Append worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, rankingsWorksheet, 'Rankings');
    XLSX.utils.book_append_sheet(workbook, recommendationsWorksheet, 'Recommendations');
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `analysis-results-${new Date().toISOString()}.xlsx`);
  };

  const SortableHeader = ({ column, title }: { column: string; title: string }) => (
    <TableHead onClick={() => handleSort(column)} className="cursor-pointer hover:bg-muted">
      <div className="flex items-center gap-1">
        {title}
        <span className="ml-1 text-gray-400">{sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6 mt-8">
      {/* Header with Timestamp, Refresh, and Download */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Analysis Results</h3>
        <div className="flex items-center gap-2">
          <p className="text-gray-500 text-sm">Last Analysis: {lastAnalysisTimestamp}</p>
          <Button
            onClick={handleDownloadAnalysis}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Download size={16} />
            Download Analysis
          </Button>
          <Button
            onClick={onRefresh}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
          >
            <RefreshCw size={16} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Summary</h4>
        <p className="text-gray-600">{analysis.summary}</p>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Rankings</h4>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Rank</TableHead>
                <TableHead>Company Name</TableHead>
                <SortableHeader column="overall_score" title="Overall Score" />
                <SortableHeader column="financial_health_score" title="Financial Health" />
                <SortableHeader column="strategic_fit_score" title="Strategic Fit" />
                <SortableHeader column="operational_compatibility_score" title="Operational Compatibility" />
                <SortableHeader column="leadership_innovation_score" title="Leadership Innovation" />
                <SortableHeader column="cultural_integration_score" title="Cultural Integration" />
                <TableHead>Rationale</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRankings.map((company, index) => (
                <TableRow key={company.name} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-semibold">{company.name}</TableCell>
                  <TableCell>{company.overall_score}</TableCell>
                  <TableCell>{company.financial_health_score}</TableCell>
                  <TableCell>{company.strategic_fit_score}</TableCell>
                  <TableCell>{company.operational_compatibility_score}</TableCell>
                  <TableCell>{company.leadership_innovation_score}</TableCell>
                  <TableCell>{company.cultural_integration_score}</TableCell>
                  <TableCell className="max-w-[200px]">{company.rationale}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => openCompanyDetails(company.name)} // Pass the company name to look up full details
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Recommendations</h4>
        {analysis.recommendations.length > 0 ? (
          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h5 className="text-sm font-medium text-gray-800">{rec.name}</h5>
                <p className="text-gray-600 mt-1">
                  <span className="font-semibold">Merger Potential:</span> {rec.merger_potential}
                </p>
                <p className="text-gray-600 mt-1">
                  <span className="font-semibold">Key Synergies:</span> {rec.key_synergies.join(', ')}
                </p>
                <p className="text-gray-600 mt-1">
                  <span className="font-semibold">Potential Risks:</span> {rec.potential_risks.join(', ')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recommendations available.</p>
        )}
      </div>

      <CompanyDetailsDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        company={selectedCompany}
      />
    </div>
  );
};

export default AnalysisResults;