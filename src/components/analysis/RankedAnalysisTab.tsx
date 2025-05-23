// components/analysis/RankedAnalysisTab.tsx
import { useState, useEffect } from 'react';
import { Button } from '../../components/botton';
import CompanyFilters from './CompanyFilters';
import CompanySelection from './CompanySelection';
import AnalysisResults from './AnalysisResults';
import AnalysisCompleteDialog from './AnalysisCompleteDialog';
import api from '../../services/api';

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

interface Filters {
  office_locations: string[]; // Changed to string[]
  revenue: string;
  industry: string;
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

interface RankedAnalysisTabProps {
  companies: CompanyCardProps[];
  categorizeRevenue: (revenue: string) => string;
}

const RANKED_ANALYSIS_STORAGE_KEY = 'accenture-ranked-analysis';

const RankedAnalysisTab = ({ companies, categorizeRevenue }: RankedAnalysisTabProps) => {
  const [filters, setFilters] = useState<Filters>({
    office_locations: [], // Changed to empty array
    revenue: 'All',
    industry: 'All',
  });
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Load saved analysis from local storage on mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem(RANKED_ANALYSIS_STORAGE_KEY) || '{}');
    if (savedData && savedData.analysis && savedData.timestamp && savedData.selectedCompanies) {
      setAnalysis(savedData.analysis);
      setLastAnalysisTimestamp(savedData.timestamp);
      setSelectedCompanies(savedData.selectedCompanies);
    }
  }, []);

  const handleRunAnalysis = async () => {
    if (selectedCompanies.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setShowDialog(true); // Show dialog when analysis starts

    try {
      // Prepare data for /analyze API
      const companiesToAnalyze = companies
        .filter(c => selectedCompanies.includes(c.name))
        .map(c => ({
          name: c.name,
          domain_name: c.domain_name || '',
          estimated_revenue: c.estimated_revenue || c.revenue || 'Unknown',
          revenue_growth: c.revenue_growth || 'Unknown',
          employee_count: c.employee_count || 'Unknown',
          key_clients: c.key_clients || [],
          leadership: c.leadership || [],
          merger_synergies: c.merger_synergies || 'Unknown',
          Industries: Array.isArray(c.Industries)
            ? c.Industries
            : c.Industries
            ? [c.Industries]
            : ['General'],
          Services: c.Services || 'Unknown',
          Broad_Category: c.Broad_Category || 'Unknown',
          Ownership: c.Ownership || 'Unknown',
          sources: c.sources || [],
          office_locations: c.office_locations || [],
          validation_warnings: c.validation_warnings || [],
        }));

      const response = await api.analyzeCompanies({ companies: companiesToAnalyze });
      const timestamp = new Date().toLocaleString();
      setAnalysis(response.analysis);
      setLastAnalysisTimestamp(timestamp);

      // Save to local storage
      localStorage.setItem(
        RANKED_ANALYSIS_STORAGE_KEY,
        JSON.stringify({
          analysis: response.analysis,
          timestamp,
          selectedCompanies,
        })
      );
    } catch (err) {
      setError('Failed to analyze companies. Please try again.');
      setShowDialog(false); // Close dialog on error
      console.error('Error running analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Ranked Analysis</h2>
        <p className="text-gray-500">Select companies to analyze and view AI-driven rankings for merger candidacy</p>
      </div>

      {/* Filters and Selection */}
      <CompanyFilters
        companies={companies}
        onFilterChange={setFilters}
        categorizeRevenue={categorizeRevenue}
      />
      <CompanySelection
        companies={companies}
        filters={filters}
        selectedCompanies={selectedCompanies}
        onSelectCompanies={setSelectedCompanies}
        categorizeRevenue={categorizeRevenue}
      />

      {/* Run Analysis Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleRunAnalysis}
          disabled={selectedCompanies.length === 0 || isAnalyzing}
          className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <span className="animate-spin">⟳</span>
              Analyzing companies...
            </>
          ) : (
            'Run Analysis'
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && lastAnalysisTimestamp && (
        <AnalysisResults
          analysis={analysis}
          lastAnalysisTimestamp={lastAnalysisTimestamp}
          onRefresh={handleRunAnalysis}
          companies={companies} // Pass companies for detailed view
        />
      )}

      {/* Analysis Dialog (shown during processing and after completion) */}
      <AnalysisCompleteDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
};

export default RankedAnalysisTab;