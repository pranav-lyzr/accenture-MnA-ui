import React from 'react';
import { Building2, Users, TrendingUp, DollarSign } from 'lucide-react';

interface Company {
  name: string;
  domain_name: string;
  estimated_revenue: string;
  employee_count: string;
  industries: string[];
  services: string[];
  broad_category: string;
  ownership: string;
  key_clients: string[];
  leadership: {
    ceo: string;
    cto: string;
    key_executives: string[];
  };
  merger_synergies: string[];
  revenue_growth: string;
  sources: string[];
}

interface CompanyCardProps {
  company: Company;
  isSelected: boolean;
  onSelect: (company: Company) => void;
}

// export const CompanyCard: React.FC<CompanyCardProps> = ({ company, isSelected, onSelect }) => {
export const CompanyCard: React.FC<CompanyCardProps> = ({ company, isSelected }) => {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      // onClick={() => onSelect(company)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{company.name}</h3>
            <p className="text-sm text-gray-600">{company.domain_name}</p>
          </div>
        </div>
        {/* <div className={`w-5 h-5 rounded-full border-2 ${
          isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
        }`}>
          {isSelected && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div> */}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-700">{company.estimated_revenue}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-700">{company.employee_count}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-700">{company.revenue_growth}</span>
        </div>
        <div className="text-sm text-gray-700 font-medium">{company.ownership}</div>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Category:</p>
        <p className="text-sm text-gray-600">{company.broad_category}</p>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Industries:</p>
        <div className="flex flex-wrap gap-1">
          {company.industries.slice(0, 3).map((industry, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {industry}
            </span>
          ))}
          {company.industries.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{company.industries.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Key Synergies:</p>
        <div className="space-y-1">
          {company.merger_synergies.slice(0, 2).map((synergy, idx) => (
            <p key={idx} className="text-xs text-gray-600">• {synergy}</p>
          ))}
          {company.merger_synergies.length > 2 && (
            <p className="text-xs text-gray-500">+{company.merger_synergies.length - 2} more synergies</p>
          )}
        </div>
      </div>

      <div className="border-t pt-2">
        <p className="text-xs text-gray-500">
          Sources: {company.sources.join(', ')}
        </p>
      </div>
    </div>
  );
};