import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileText, Link, TrendingUp, Users, Briefcase, Star, Award, Circle } from 'lucide-react';

interface CompanyData {
  rank?: number;
  name: string;
  domain_name?: string;
  estimated_revenue?: string;
  revenue_growth?: string;
  profitability?: string;
  valuation_estimate?: string;
  employee_count?: string;
  office_locations?: string[];
  key_clients?: string[];
  average_contract_value?: string;
  leadership?: { name: string; title: string; experience: string }[];
  primary_domains?: string | string[];
  proprietary_methodologies?: string;
  technology_tools?: string[];
  competitive_advantage?: string;
  merger_synergies?: string;
  cultural_alignment?: string;
  integration_challenges?: string;
  market_penetration?: string;
  sources?: string[];
  innovation_metrics?: string;
  case_studies?: string[];
  technological_enablement_score?: string;
  global_sourcing_reach?: string;
}

export interface CompanyCardProps {
  company: CompanyData;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  if (!company) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
        <CardContent className="pt-12 pb-12 text-center">
          <Circle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No company data available</p>
        </CardContent>
      </Card>
    );
  }

  const renderSection = (title: string, content: React.ReactNode, icon: React.ReactNode) => {
    if (!content) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
          <div className="p-2 rounded-lg bg-purple-100">
            {icon}
          </div>
          {title}
        </div>
        <div className="ml-12 space-y-3 text-gray-700">
          {content}
        </div>
      </div>
    );
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200 bg-white rounded-2xl overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50 p-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h3>
            {company.domain_name && (
              <a 
                href={`https://${company.domain_name}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:underline transition-colors font-medium"
              >
                <Link className="w-4 h-4" />
                {company.domain_name}
              </a>
            )}
          </div>
          {company.rank && company.rank > 0 && (
            <Badge variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 text-sm font-semibold rounded-full">
              Rank #{company.rank}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        {/* Financials Section */}
        {renderSection(
          "Financial Overview",
          (company.estimated_revenue || company.revenue_growth || company.profitability || company.valuation_estimate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.estimated_revenue && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                  <p className="text-sm font-semibold text-green-700 mb-1">Revenue</p>
                  <p className="text-xl font-bold text-green-800">{company.estimated_revenue}</p>
                </div>
              )}
              {company.revenue_growth && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-1">Growth Rate</p>
                  <p className="text-xl font-bold text-blue-800">{company.revenue_growth}</p>
                </div>
              )}
              {company.profitability && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-xl border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-700 mb-1">Profitability</p>
                  <p className="text-xl font-bold text-yellow-800">{company.profitability}</p>
                </div>
              )}
              {company.valuation_estimate && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border border-purple-200">
                  <p className="text-sm font-semibold text-purple-700 mb-1">Valuation</p>
                  <p className="text-xl font-bold text-purple-800">{company.valuation_estimate}</p>
                </div>
              )}
            </div>
          ),
          <TrendingUp className="w-5 h-5 text-purple-600" />
        )}

        {/* Operations Section */}
        {renderSection(
          "Operations & Scale",
          (company.employee_count || company.office_locations || company.key_clients) && (
            <div className="space-y-5">
              {company.employee_count && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">{company.employee_count} employees</span>
                </div>
              )}
              {company.office_locations && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3">Global Presence</p>
                  <div className="flex flex-wrap gap-2">
                    {company.office_locations.map((location, i) => (
                      <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-3 py-1">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {company.key_clients && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3">Key Clients</p>
                  <div className="flex flex-wrap gap-2">
                    {company.key_clients.map((client, i) => (
                      <Badge key={i} variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1">
                        {client}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
          <Briefcase className="w-5 h-5 text-purple-600" />
        )}

        {/* Services Section */}
        {renderSection(
          "Services & Expertise",
          (company.primary_domains || company.proprietary_methodologies || company.technology_tools) && (
            <div className="space-y-5">
              {company.primary_domains && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200">
                  <p className="font-semibold text-purple-800 mb-3">Primary Domains</p>
                  <p className="text-gray-700 leading-relaxed">{Array.isArray(company.primary_domains) ? company.primary_domains.join(', ') : company.primary_domains}</p>
                </div>
              )}
              {company.proprietary_methodologies && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-200">
                  <p className="font-semibold text-emerald-800 mb-3">Methodologies</p>
                  <p className="text-gray-700 leading-relaxed">{company.proprietary_methodologies}</p>
                </div>
              )}
              {company.technology_tools && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3">Technology Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {company.technology_tools.map((tool, i) => (
                      <Badge key={i} variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 px-3 py-1">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
          <Star className="w-5 h-5 text-purple-600" />
        )}

        {/* Competitive Analysis Section */}
        {renderSection(
          "Competitive Position",
          (company.competitive_advantage || company.market_penetration) && (
            <div className="space-y-5">
              {company.competitive_advantage && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                  <p className="font-semibold text-amber-800 mb-3">Competitive Advantage</p>
                  <p className="text-gray-700 leading-relaxed">{company.competitive_advantage}</p>
                </div>
              )}
              {company.market_penetration && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-xl border border-rose-200">
                  <p className="font-semibold text-rose-800 mb-3">Market Penetration</p>
                  <p className="text-gray-700 leading-relaxed">{company.market_penetration}</p>
                </div>
              )}
            </div>
          ),
          <Award className="w-5 h-5 text-purple-600" />
        )}

        {/* Sources Section */}
        {company.sources && company.sources.length > 0 && (
          <div className="pt-6 mt-8 border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-4">
              <FileText className="w-4 h-4 text-purple-600" />
              Data Sources
            </div>
            <div className="bg-gray-50 rounded-lg p-5 space-y-2">
              {company.sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors p-2 hover:bg-blue-50 rounded"
                >
                  {source}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyCard;