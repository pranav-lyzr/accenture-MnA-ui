import { useState, useEffect } from 'react';
import { useToast } from "../hooks/use-toast";
import Layout from '../components/layout/Layout';
import DashboardCard from "../ui/DashboardCard";
import { BarChart2, Search, Users } from 'lucide-react';
import { Button } from '../components/botton';
import api, { MergerSearchResponse } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import LoadingPopup from '../components/ui/LoadingPopup';

const STORAGE_KEY = 'accenture-merger-results';

// Local interface to match the actual API response structure for claude_analysis
interface ClaudeAnalysis {
  rankings: {
    name: string;
    overall_score: number;
    financial_health_score: number;
    strategic_fit_score: number;
    operational_compatibility_score: number;
    leadership_innovation_score: number;
    cultural_integration_score: number;
    rationale: string;
  }[];
  recommendations: {
    name: string;
    merger_potential: string;
    key_synergies: string[];
    potential_risks: string[];
  }[];
  summary: string;
}

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MergerSearchResponse | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const savedResults = localStorage.getItem(STORAGE_KEY);
        if (savedResults) {
          setResults(JSON.parse(savedResults));
        } else {
          const data = await api.getResults();
          setResults(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: "Error",
          description: "Failed to load merger search results",
          variant: "destructive",
        });
        setResults(null);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [toast]);

  const handleRunMergerSearch = async () => {
    try {
      setLoading(true);
      const data = await api.runMergerSearch();
      setResults(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Success",
        description: "Merger search completed successfully",
      });
    } catch (error) {
      console.error('Error running merger search:', error);
      toast({
        title: "Error",
        description: "Failed to run merger search",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Safely access nested properties with type assertion
  const claudeAnalysis = results?.results?.claude_analysis as ClaudeAnalysis | undefined;
  const companiesCount = results?.results?.consolidated_companies?.length || 0;
  const topCandidatesCount = claudeAnalysis?.rankings?.length || 0;
  const hasAnalysis = !!claudeAnalysis;
  const recommendedCandidate = claudeAnalysis?.rankings?.[0];
  const topCandidates = claudeAnalysis?.rankings || [];
  const recommendations = claudeAnalysis?.recommendations || [];

  return (
    <Layout>
      <LoadingPopup
        isOpen={loading}
        message="Running Merger Analysis"
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Merger Analysis Dashboard</h1>
          <p className="text-gray-500">View and analyze potential merger candidates</p>
        </div>

        <div className="flex space-x-3">
          <Button
            disabled={loading}
            onClick={handleRunMergerSearch}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {loading ? "Running Analysis..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Search Prompts"
          value="5"
          icon={<Search size={24} />}
        />
        <DashboardCard
          title="Companies Identified"
          value={companiesCount.toString()}
          icon={<Users size={24} />}
        />
        <DashboardCard
          title="Top Candidates"
          value={topCandidatesCount.toString()}
          icon={<Users size={24} />}
        />
        <DashboardCard
          title="Analysis Reports"
          value={results ? "1" : "0"}
          icon={<BarChart2 size={24} />}
        />
      </div>

      {loading ? null : hasAnalysis && recommendedCandidate ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Merger Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{recommendedCandidate.name}</h3>
                <p className="text-gray-600">{recommendedCandidate.rationale}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Overall Score</h4>
                    <p className="text-gray-600">{recommendedCandidate.overall_score}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Financial Health</h4>
                    <p className="text-gray-600">{recommendedCandidate.financial_health_score}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Strategic Fit</h4>
                    <p className="text-gray-600">{recommendedCandidate.strategic_fit_score}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Operational Compatibility</h4>
                    <p className="text-gray-600">{recommendedCandidate.operational_compatibility_score}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topCandidates.map((candidate: { 
                  name: string;
                  overall_score: number;
                  financial_health_score: number;
                  strategic_fit_score: number;
                  operational_compatibility_score: number;
                  leadership_innovation_score: number;
                  cultural_integration_score: number;
                  rationale: string;
                }, index: number) => {
                  const recommendation = recommendations.find((rec: { name: string }) => rec.name === candidate.name);
                  return (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold">{candidate.name}</h3>
                        <span className="text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded">
                          Rank #{index + 1}
                        </span>
                      </div>

                      <div className="grid gap-4">
                        <div>
                          <h4 className="font-medium mb-1">Rationale</h4>
                          <p className="text-gray-600">{candidate.rationale}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Overall Score</h4>
                            <p className="text-gray-600">{candidate.overall_score}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Financial Health</h4>
                            <p className="text-gray-600">{candidate.financial_health_score}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Strategic Fit</h4>
                            <p className="text-gray-600">{candidate.strategic_fit_score}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Operational Compatibility</h4>
                            <p className="text-gray-600">{candidate.operational_compatibility_score}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Leadership Innovation</h4>
                            <p className="text-gray-600">{candidate.leadership_innovation_score}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Cultural Integration</h4>
                            <p className="text-gray-600">{candidate.cultural_integration_score}</p>
                          </div>
                        </div>

                        {recommendation && (
                          <>
                            <div>
                              <h4 className="font-medium mb-1">Merger Potential</h4>
                              <p className="text-gray-600">{recommendation.merger_potential}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Key Synergies</h4>
                              <ul className="text-gray-600 list-disc pl-5">
                                {recommendation.key_synergies.map((synergy: string, i: number) => (
                                  <li key={i}>{synergy}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Potential Risks</h4>
                              <ul className="text-gray-600 list-disc pl-5">
                                {recommendation.potential_risks.map((risk: string, i: number) => (
                                  <li key={i}>{risk}</li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {claudeAnalysis?.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{claudeAnalysis.summary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <BarChart2 size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No Analysis Results Yet</h3>
          <p className="text-gray-500 mt-2">Run the merger search to generate candidate analysis</p>
          <Button
            className="mt-4 bg-purple-500 hover:bg-purple-600"
            onClick={handleRunMergerSearch}
            disabled={loading}
          >
            Run Analysis
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Index;