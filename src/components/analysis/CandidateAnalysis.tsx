import { Star } from 'lucide-react';

export interface CandidateProps {
  rank: number;
  name: string;
  reason: string;
  valuation: string;
  strategicFit: string;
  synergies: string;
  challenges: string;
  references?: string[];
}

const CandidateAnalysis = ({
  rank,
  name,
  reason,
  valuation,
  strategicFit,
  synergies,
  challenges,
  references = []
}: CandidateProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mb-8 border border-gray-100">
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-2xl shadow-lg">
              {rank}
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
              <div className="flex items-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i}
                    size={20}
                    fill={i < (6 - rank) ? "#FFD700" : "none"}
                    stroke={i < (6 - rank) ? "#FFD700" : "#E2E8F0"}
                    className="transition-colors duration-200"
                  />
                ))}
                <span className="ml-2 text-sm text-gray-500 font-medium">
                  {6 - rank}/5 Rating
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Estimated Valuation</p>
            <p className="text-2xl font-bold text-gray-900">{valuation}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3">
              Why This Candidate?
            </h4>
            <p className="text-gray-700 leading-relaxed text-base">{reason}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3">
              Strategic Fit
            </h4>
            <p className="text-gray-700 leading-relaxed text-base">{strategicFit}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3">
              Potential Synergies
            </h4>
            <p className="text-gray-700 leading-relaxed text-base">{synergies}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3">
              Integration Challenges
            </h4>
            <p className="text-gray-700 leading-relaxed text-base">{challenges}</p>
          </div>
        </div>
        
        {references && references.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4">
              References
            </h4>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                {references.map((ref, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm leading-relaxed">{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateAnalysis;