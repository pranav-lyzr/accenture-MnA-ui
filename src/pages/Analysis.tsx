import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import CandidateAnalysis from '../components/analysis/CandidateAnalysis';
import { BarChart2, Download, Award, FileText } from 'lucide-react';
import { Button } from '../components/botton';
import { useToast } from "../hooks/use-toast";
import api, { AnalysisData } from '../services/api';

const Analysis = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const results = await api.getResults();
        
        if (results.results?.claude_analysis) {
          setAnalysis(results.results.claude_analysis);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load analysis data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [toast]);
  
  const handleDownloadJSON = () => {
    api.downloadJSON();
    toast({
      title: "Download Started",
      description: "Your analysis report is being downloaded",
    });
  };
  
  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analysis</h1>
          <p className="text-gray-500">Comprehensive merger candidate analysis</p>
        </div>
        
        <Button
          variant="outline" 
          className="flex items-center space-x-2"
          onClick={handleDownloadJSON}
        >
          <Download size={16} />
          <span>Download Report</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-opacity-25 border-t-purple-500"></div>
          <p className="mt-2 text-gray-500">Loading analysis data...</p>
        </div>
      ) : analysis ? (
        <div>
          {/* Recommended candidate */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="mr-2 text-purple-500" size={24} />
              Recommended Merger Candidate
            </h2>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-200 text-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold">{analysis.recommended_candidate.name}</h3>
              <p className="mt-3">{analysis.recommended_candidate.justification}</p>
            </div>
          </div>
          
          {/* Top candidates */}
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BarChart2 className="mr-2 text-purple-500" size={24} />
            Top Merger Candidates
          </h2>
          
          <div className="space-y-6 mb-8">
            {analysis.top_candidates.map((candidate) => (
              <CandidateAnalysis
                key={candidate.name}
                rank={candidate.rank}
                name={candidate.name}
                reason={candidate.reason}
                valuation={candidate.valuation}
                strategicFit={candidate.strategic_fit}
                synergies={candidate.synergies}
                challenges={candidate.challenges}
                references={candidate.references}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <FileText size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No Analysis Available</h3>
          <p className="text-gray-500 mt-2">Run the merger search to generate candidate analysis</p>
          <Button className="mt-4 bg-purple-500 hover:bg-purple-200">
            Run Analysis
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Analysis;