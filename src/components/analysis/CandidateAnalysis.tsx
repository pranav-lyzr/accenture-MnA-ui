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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden card-hover mb-6">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500 text-white font-bold text-xl">
              {rank}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-800">{name}</h3>
              <div className="flex items-center mt-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i}
                    size={16}
                    fill={i < (6 - rank) ? "#FFD700" : "none"}
                    stroke={i < (6 - rank) ? "#FFD700" : "#CBD5E1"}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-gray-100 rounded-md">
            <p className="text-sm font-medium">Estimated Valuation</p>
            <p className="text-lg font-bold">{valuation}</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Why This Candidate?</h4>
            <p className="text-base text-gray-700">{reason}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Strategic Fit</h4>
            <p className="text-base text-gray-700">{strategicFit}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Potential Synergies</h4>
            <p className="text-base text-gray-700">{synergies}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Integration Challenges</h4>
            <p className="text-base text-gray-700">{challenges}</p>
          </div>
        </div>
        
        {references && references.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">References</h4>
            <ul className="list-disc pl-5 space-y-1">
              {references.map((ref, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {ref}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateAnalysis;
