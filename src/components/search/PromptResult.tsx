import { CompanyDetails } from "../../types/search";
import { FileText } from "lucide-react";

interface PromptResultProps {
  title: string;
  companies: CompanyDetails[];
  sources: string[];
}

const PromptResult = ({ title, companies, sources }: PromptResultProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      
      <div className="space-y-6">
        {companies.map((company, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-semibold text-gray-700">{company.name}</h4>
              {company.rank && (
                <span className="text-sm bg-purple-500/10 text-purple-500 px-2 py-1 rounded">
                  Rank #{company.rank}
                </span>
              )}
            </div>
            
            {company.primary_domains && (
              <p className="mt-2 text-gray-600">
                <span className="font-medium">Domains:</span> {company.primary_domains}
              </p>
            )}
            
            {company.competitive_advantage && (
              <p className="mt-2 text-gray-600">
                <span className="font-medium">Competitive Advantage:</span> {company.competitive_advantage}
              </p>
            )}
            
            {company.market_penetration && (
              <p className="mt-2 text-gray-600">
                <span className="font-medium">Market Penetration:</span> {company.market_penetration}
              </p>
            )}
            
            {company.sources && company.sources.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center text-sm text-gray-500">
                  <FileText size={16} className="mr-1" />
                  <span>Sources:</span>
                </div>
                <div className="mt-1 space-y-1">
                  {company.sources.map((source: string, i: number) => (
                    <a
                      key={i}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-500 hover:underline"
                    >
                      {source}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <FileText size={16} className="mr-1" />
          <span>Research Sources:</span>
        </div>
        <div className="mt-2 space-y-1">
          {sources.map((source: string, i: number) => (
            <a
              key={i}
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-500 hover:underline"
            >
              {source}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptResult;