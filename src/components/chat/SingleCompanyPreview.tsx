import React from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Target,
  User,
  GraduationCap
} from 'lucide-react';

interface SingleCompanyProfileProps {
  companyProfile: any;
}

export const SingleCompanyProfile: React.FC<SingleCompanyProfileProps> = ({ companyProfile }) => {
  const getReadinessColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{companyProfile.name}</h2>
          <p className="text-gray-600 mb-2">{companyProfile.domain_name}</p>
          <p className="text-sm text-gray-700">{companyProfile.broad_category}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Revenue</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{companyProfile.estimated_revenue}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Employees</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{companyProfile.employee_count}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Growth</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{companyProfile.revenue_growth}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Ownership</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{companyProfile.ownership}</p>
        </div>
      </div>

      {/* Strategic Assessment */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Acquisition Readiness</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              getReadinessColor(companyProfile.strategic_assessment?.acquisition_readiness || 'Medium')
            }`}>
              {companyProfile.strategic_assessment?.acquisition_readiness || 'Medium'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Cultural Fit</p>
            <p className="text-sm text-gray-600">{companyProfile.strategic_assessment?.cultural_fit || 'Good alignment'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Integration Complexity</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              getComplexityColor(companyProfile.strategic_assessment?.integration_complexity || 'Medium')
            }`}>
              {companyProfile.strategic_assessment?.integration_complexity || 'Medium'}
            </span>
          </div>
        </div>
      </div>

      {/* Industries & Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Industries</h3>
          <div className="flex flex-wrap gap-2">
            {companyProfile.industries?.map((industry: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Services</h3>
          <div className="flex flex-wrap gap-2">
            {companyProfile.services?.map((service: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leadership Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Key Executives</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm"><strong>CEO:</strong> {companyProfile.leadership?.ceo}</p>
              <p className="text-sm"><strong>CTO:</strong> {companyProfile.leadership?.cto}</p>
              {companyProfile.leadership?.key_executives?.map((exec: string, idx: number) => (
                <p key={idx} className="text-sm">• {exec}</p>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Talent Sources</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Universities:</p>
                {companyProfile.leadership?.talent_sources?.universities?.map((uni: string, idx: number) => (
                  <p key={idx} className="text-sm text-gray-600">• {uni}</p>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Previous Companies:</p>
                {companyProfile.leadership?.talent_sources?.previous_companies?.map((company: string, idx: number) => (
                  <p key={idx} className="text-sm text-gray-600">• {company}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Merger Synergies */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Merger Synergies</h3>
        <div className="space-y-3">
          {companyProfile.merger_synergies?.map((synergy: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">{synergy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Metrics */}
      {companyProfile.financial_metrics && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Valuation</p>
              <p className="text-lg font-semibold text-gray-900">{companyProfile.financial_metrics.valuation}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Funding</p>
              <p className="text-lg font-semibold text-gray-900">{companyProfile.financial_metrics.funding_rounds}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Profitability</p>
              <p className="text-lg font-semibold text-gray-900">{companyProfile.financial_metrics.profitability}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Clients */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Clients</h3>
        <div className="flex flex-wrap gap-2">
          {companyProfile.key_clients?.map((client: string, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
            >
              {client}
            </span>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500">
          <strong>Sources:</strong> {companyProfile.sources?.join(', ')}
        </p>
      </div>
    </div>
  );
};