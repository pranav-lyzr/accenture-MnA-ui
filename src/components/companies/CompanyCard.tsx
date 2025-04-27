import { Card, CardContent, CardHeader } from '../ui/card';
import Badge from '../ui/badge';
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
  company: CompanyData; // Make company required
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  if (!company) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="pt-6 text-center text-gray-500">
          <Circle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          No company data available
        </CardContent>
      </Card>
    );
  }

  const renderSection = (title: string, content: React.ReactNode, icon: React.ReactNode) => {
    if (!content) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          {icon}
          {title}
        </div>
        <div className="pl-7 space-y-2 text-gray-600">
          {content}
        </div>
      </div>
    );
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{company.name}</h3>
            {company.domain_name && (
              <a 
                href={`https://${company.domain_name}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-sm text-blue-400 hover:underline mt-1"
              >
                <Link className="w-4 h-4" />
                {company.domain_name}
              </a>
            )}
          </div>
          {company.rank && company.rank > 0 && (
            <Badge variant="secondary" className="bg-purple-200 text-purple-500 hover:bg-purple-400">
              Rank #{company.rank}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Financials Section */}
        {renderSection(
          "Financials",
          (company.estimated_revenue || company.revenue_growth || company.profitability || company.valuation_estimate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.estimated_revenue && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <p className="text-lg font-semibold">{company.estimated_revenue}</p>
                </div>
              )}
              {company.revenue_growth && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Growth</p>
                  <p className="text-lg font-semibold">{company.revenue_growth}</p>
                </div>
              )}
              {company.profitability && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Profitability</p>
                  <p className="text-lg font-semibold">{company.profitability}</p>
                </div>
              )}
              {company.valuation_estimate && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Valuation</p>
                  <p className="text-lg font-semibold">{company.valuation_estimate}</p>
                </div>
              )}
            </div>
          ),
          <TrendingUp className="w-5 h-5 text-purple-500" />
        )}

        {/* Operations Section */}
        {renderSection(
          "Operations",
          (company.employee_count || company.office_locations || company.key_clients) && (
            <div className="space-y-3">
              {company.employee_count && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{company.employee_count} employees</span>
                </div>
              )}
              {company.office_locations && (
                <div>
                  <p className="font-medium mb-1">Locations</p>
                  <div className="flex flex-wrap gap-2">
                    {company.office_locations.map((location, i) => (
                      <Badge key={i} variant="outline">{location}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {company.key_clients && (
                <div>
                  <p className="font-medium mb-1">Key Clients</p>
                  <div className="flex flex-wrap gap-2">
                    {company.key_clients.map((client, i) => (
                      <Badge key={i} variant="secondary">{client}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
          <Briefcase className="w-5 h-5 text-purple-500" />
        )}

        {/* Services Section */}
        {renderSection(
          "Services & Expertise",
          (company.primary_domains || company.proprietary_methodologies || company.technology_tools) && (
            <div className="space-y-4">
              {company.primary_domains && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Primary Domains</p>
                  <p>{Array.isArray(company.primary_domains) ? company.primary_domains.join(', ') : company.primary_domains}</p>
                </div>
              )}
              {company.proprietary_methodologies && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Methodologies</p>
                  <p>{company.proprietary_methodologies}</p>
                </div>
              )}
              {company.technology_tools && (
                <div className="flex flex-wrap gap-2">
                  {company.technology_tools.map((tool, i) => (
                    <Badge key={i} variant="outline" className="bg-purple-500">{tool}</Badge>
                  ))}
                </div>
              )}
            </div>
          ),
          <Star className="w-5 h-5 text-purple-500" />
        )}

        {/* Competitive Analysis Section */}
        {renderSection(
          "Competitive Analysis",
          (company.competitive_advantage || company.market_penetration) && (
            <div className="space-y-4">
              {company.competitive_advantage && (
                <div className="bg-gradient-to-r from-purple-100 to-transparent p-4 rounded-lg">
                  <p className="font-medium mb-2">Competitive Advantage</p>
                  <p>{company.competitive_advantage}</p>
                </div>
              )}
              {company.market_penetration && (
                <div className="bg-gradient-to-r from-purple-100 to-transparent p-4 rounded-lg">
                  <p className="font-medium mb-2">Market Penetration</p>
                  <p>{company.market_penetration}</p>
                </div>
              )}
            </div>
          ),
          <Award className="w-5 h-5 text-purple-500" />
        )}

        {/* Sources Section */}
        {company.sources && company.sources.length > 0 && (
          <div className="pt-4 mt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <FileText className="w-4 h-4" />
              Sources
            </div>
            <div className="space-y-1 pl-6">
              {company.sources.map((source, index) => (
                <a
                  key={index}
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
      </CardContent>
    </Card>
  );
};

export default CompanyCard;