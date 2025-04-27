import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import CandidateAnalysis from '../components/analysis/CandidateAnalysis';
import { Search, Filter, Users } from 'lucide-react';
import { Button } from '../components/botton';
import { useToast } from "../hooks/use-toast";
import api, { AnalysisData } from '../services/api';

const Candidates = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<AnalysisData['top_candidates']>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const results = await api.getResults();
        
        if (results.results?.claude_analysis?.top_candidates) {
          setCandidates(results.results.claude_analysis.top_candidates);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load candidate data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [toast]);
  
  const filteredCandidates = searchTerm
    ? candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : candidates;
  
  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Merger Candidates</h1>
          <p className="text-gray-500">Detailed profile of top merger candidates</p>
        </div>
      </div>
      
      {/* Search and filter bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <Button variant="outline" className="flex items-center space-x-2 flex-shrink-0">
          <Filter size={16} />
          <span>Filter</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-opacity-25 border-t-purple-500"></div>
          <p className="mt-2 text-gray-500">Loading candidates...</p>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="space-y-6">
          {filteredCandidates.map((candidate) => (
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
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Users size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">
            {searchTerm ? "No matching candidates found" : "No candidates found"}
          </h3>
          <p className="text-gray-500 mt-2">
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "Run the merger search to generate candidate analysis"}
          </p>
        </div>
      )}
    </Layout>
  );
};

export default Candidates;
