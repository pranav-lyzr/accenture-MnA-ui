import React, { useState } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  CheckCircle, 
  ExternalLink, 
  ChevronDown, 
  ChevronRight,
  Target,
  BookOpen,
  Users,
  AlertTriangle
} from 'lucide-react';

interface GenericResponseProps {
  response: any;
  followUpSuggestions?: string[];
  onFollowUpClick?: (question: string) => void;
}

export const GenericResponse: React.FC<GenericResponseProps> = ({ 
  response, 
  followUpSuggestions,
  onFollowUpClick 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const renderDetailedAnalysis = (detailedAnalysis: any) => {
    if (typeof detailedAnalysis === 'string') {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{detailedAnalysis}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(detailedAnalysis).map(([key, value]: [string, any]) => {
          const sectionKey = `detailed-${key}`;
          const isExpanded = expandedSections.has(sectionKey);
          
          return (
            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
              >
                <h4 className="font-semibold text-gray-900">{key}</h4>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {isExpanded && (
                <div className="p-4 bg-white">
                  {value.purpose && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Purpose</span>
                      </div>
                      <p className="text-sm text-blue-800">{value.purpose}</p>
                    </div>
                  )}
                  
                  {value.key_criteria && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Key Criteria:</h5>
                      <div className="space-y-2">
                        {value.key_criteria.map((criterion: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">{criterion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {typeof value === 'string' && (
                    <p className="text-sm text-gray-700">{value}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
        <p className="text-gray-700 leading-relaxed">{response.summary}</p>
      </div>

      {/* Detailed Analysis */}
      {response.detailed_analysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis</h3>
          </div>
          {renderDetailedAnalysis(response.detailed_analysis)}
        </div>
      )}

      {/* Key Insights */}
      {response.key_insights && response.key_insights.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
          </div>
          <div className="space-y-3">
            {response.key_insights.map((insight: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Trends */}
      {response.market_trends && response.market_trends.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Market Trends</h3>
          </div>
          <div className="space-y-3">
            {response.market_trends.map((trend: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{trend}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {response.recommendations && response.recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {response.recommendations.map((recommendation: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Suggestions */}
      {followUpSuggestions && followUpSuggestions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Follow-up Questions</h3>
          </div>
          <div className="space-y-2">
            {followUpSuggestions.map((suggestion: string, idx: number) => (
              <button
                key={idx}
                onClick={() => onFollowUpClick?.(suggestion)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200 group"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  <p className="text-sm text-gray-700 group-hover:text-purple-900">{suggestion}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Support */}
      {response.secondary_support && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Additional Support Available</h3>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            {Array.isArray(response.secondary_support) ? (
              <div className="space-y-2">
                {response.secondary_support.map((support: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-orange-800">{support}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-orange-800">{response.secondary_support}</p>
            )}
          </div>
        </div>
      )}

      {/* Sources */}
      {response.sources && response.sources.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {response.sources.map((source: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-200"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};