import { useState, useEffect } from 'react';
import { useToast } from "../hooks/use-toast";
import Layout from '../components/layout/Layout';
import CompanyCard from '../components/companies/CompanyCard';
import type { CompanyDataProps } from '../components/companies/CompanyCard';
import CompanyModal from '../components/modal/CompanyModal';
import { Search } from 'lucide-react';
import { EnrichedCompanyData } from '../services/api';

const MERGER_STORAGE_KEY = 'accenture-merger-results';
const SEARCH_STORAGE_KEY = 'accenture-search-results';

const Companies = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyDataProps[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<EnrichedCompanyData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Utility function to normalize company data from different response formats
  const getCompaniesFromResponse = (response: any): any[] => {
    // If response is an array (new format)
    if (Array.isArray(response)) {
      return response;
    }
    // If response is an object with companies array (previous format)
    if (response && typeof response === 'object' && Array.isArray(response.companies)) {
      return response.companies;
    }
    return [];
  };

  // Function to create a mapping of company data
  const createCompanyDataMapping = (mergerData: any, searchData: any) => {
    const companyMap: { [key: string]: CompanyDataProps } = {};

    const addCompanyData = (company: any) => {
      if (!company.name) return;

      const existing = companyMap[company.name] || {};
      companyMap[company.name] = {
        rank: company.rank || existing.rank || 0,
        name: company.name,
        domain_name: company.domain_name || existing.domain_name,
        estimated_revenue: company.estimated_revenue || existing.estimated_revenue || 'Unknown',
        revenue_growth: company.revenue_growth || existing.revenue_growth,
        profitability: company.profitability || existing.profitability,
        valuation_estimate: company.valuation_estimate || existing.valuation_estimate,
        employee_count: company.employee_count || existing.employee_count,
        office_locations: company.office_locations || existing.office_locations,
        key_clients: company.key_clients || existing.key_clients,
        average_contract_value: company.average_contract_value || existing.average_contract_value,
        leadership: company.leadership || existing.leadership,
        primary_domains: company.primary_domains || existing.primary_domains || ['Various consulting services'],
        proprietary_methodologies: company.proprietary_methodologies || existing.proprietary_methodologies,
        technology_tools: company.technology_tools || existing.technology_tools,
        competitive_advantage: company.competitive_advantage || existing.competitive_advantage || 'Specializes in consulting services for enterprise clients',
        merger_synergies: company.merger_synergies || existing.merger_synergies,
        cultural_alignment: company.cultural_alignment || existing.cultural_alignment,
        integration_challenges: company.integration_challenges || existing.integration_challenges,
        market_penetration: company.market_penetration || existing.market_penetration || 'Enterprise clients',
        sources: Array.from(new Set([...(company.sources || []), ...(existing.sources || [])])).filter(Boolean),
        technological_enablement_score: company.technological_enablement_score || existing.technological_enablement_score,
        global_sourcing_reach: company.global_sourcing_reach || existing.global_sourcing_reach,
      };
    };

    // Process merger and search data
    [mergerData, searchData].forEach(data => {
      if (data) {
        Object.values(data).forEach((section: any) => {
          // Handle both response formats
          const companies = getCompaniesFromResponse(section.response || section.raw_response);
          companies.forEach(addCompanyData);
        });
      }
    });

    return companyMap;
  };

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const mergerResults = JSON.parse(localStorage.getItem(MERGER_STORAGE_KEY) || '{}');
        const searchResults = JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY) || '{}');

        // Debugging logs
        console.log('Merger Results:', mergerResults);
        console.log('Search Results:', searchResults);

        const companyMap = createCompanyDataMapping(mergerResults.results || {}, searchResults);
        const uniqueCompanies = Object.values(companyMap)
          .sort((a, b) => (a.rank - b.rank) || a.name.localeCompare(b.name));

        console.log('Unique Companies:', uniqueCompanies);
        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error('Error loading companies:', error);
        toast({
          title: "Error",
          description: "Failed to load companies",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, [toast]);

  // const handleCompanyClick = async (companyName: string) => {
  //   setModalOpen(true);
  //   setModalLoading(true);
  //   setModalError(null);

  //   try {
  //     const domain = companies.find(c => c.name === companyName)?.domain_name ||
  //       companyName.toLowerCase().replace(/\s+/g, '') + '.com';
  //     const enrichedData = await api.enrichCompany(domain);
  //     setSelectedCompany(enrichedData);
  //   } catch (error) {
  //     setModalError('Failed to load company details');
  //     toast({
  //       title: "Error",
  //       description: "Failed to load company details",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setModalLoading(false);
  //   }
  // };

  const filteredCompanies = searchTerm
    ? companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : companies;

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
          <p className="text-gray-500">
            Browse and filter identified merger candidates ({companies.length} identified)
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-opacity-25 border-t-purple-500"></div>
          <p className="mt-2 text-gray-500">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700">No companies found</h3>
          <p className="text-gray-500 mt-2">Run search prompts to identify potential merger candidates</p>
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.name}
              // onClick={() => handleCompanyClick(company.name)}
              className="cursor-pointer"
            >
              <CompanyCard company={company} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Search size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No matching companies found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
        </div>
      )}

      <CompanyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCompany(null);
          setModalError(null);
        }}
        companyData={selectedCompany}
        loading={modalLoading}
        error={modalError}
      />
    </Layout>
  );
};

export default Companies;