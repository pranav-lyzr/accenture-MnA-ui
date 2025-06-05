
import { useState, useEffect } from 'react';
import { Button } from '../botton';
import { BarChart, Users, TrendingUp, AlertTriangle } from 'lucide-react';
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
  office_locations: string[];
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
    office_locations: [],
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
    setShowDialog(true);

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
      setShowDialog(false);
      console.error('Error running analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative px-8 py-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ranked Analysis</h2>
              <p className="text-indigo-100">Select companies to analyze and view AI-driven rankings for merger candidacy</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-white" />
                <div>
                  <p className="text-white/80 text-sm">Available Companies</p>
                  <p className="text-white text-lg font-semibold">{companies.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-white" />
                <div>
                  <p className="text-white/80 text-sm">Selected for Analysis</p>
                  <p className="text-white text-lg font-semibold">{selectedCompanies.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <BarChart className="h-5 w-5 text-white" />
                <div>
                  <p className="text-white/80 text-sm">Analysis Status</p>
                  <p className="text-white text-lg font-semibold">
                    {analysis ? 'Complete' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Companies</h3>
            <CompanyFilters
              companies={companies}
              onFilterChange={setFilters}
              categorizeRevenue={categorizeRevenue}
            />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Select Companies for Analysis</h3>
              <Button
                onClick={handleRunAnalysis}
                disabled={selectedCompanies.length === 0 || isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
            </div>
            <CompanySelection
              companies={companies}
              filters={filters}
              selectedCompanies={selectedCompanies}
              onSelectCompanies={setSelectedCompanies}
              categorizeRevenue={categorizeRevenue}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h4 className="text-red-900 font-semibold">Analysis Error</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && lastAnalysisTimestamp && (
        <AnalysisResults
          analysis={analysis}
          lastAnalysisTimestamp={lastAnalysisTimestamp}
          onRefresh={handleRunAnalysis}
          companies={companies}
        />
      )}

      {/* Analysis Dialog */}
      <AnalysisCompleteDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
};

export default RankedAnalysisTab;
