import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Search, ArrowUpDown, Filter, Table2, RefreshCw } from 'lucide-react';
import { Button } from '../components/botton';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  TableCaption 
} from "../components/ui/table";
import api from '../services/api';
import CompanyDetailsDialog from '../components/companies/CompanyDetailsDialog';
import LoadingPopup from '../components/ui/LoadingPopup';

// import { CompanyDetails } from '../types/search';

// Define CompanyCardProps to match the data structure
interface CompanyCardProps {
  rank: number;
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
  primary_domains?: string[];
  proprietary_methodologies?: string;
  technology_tools?: string[];
  competitive_advantage?: string;
  merger_synergies?: string;
  cultural_alignment?: string;
  integration_challenges?: string;
  market_penetration?: string;
  sources?: string[];
  technological_enablement_score?: string;
  global_sourcing_reach?: string;
}

const MERGER_STORAGE_KEY = 'accenture-merger-results';
const SEARCH_STORAGE_KEY = 'accenture-search-results';

const Companies = () => {
  const [loading, setLoading] = useState(true);
  const [redoingSearch, setRedoingSearch] = useState(false);
  const [companies, setCompanies] = useState<CompanyCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCompany, setSelectedCompany] = useState<CompanyCardProps | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

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
    const companyMap: { [key: string]: CompanyCardProps } = {};

    const addCompanyData = (company: any) => {
      if (!company.name) return;

      companyMap[company.name] = {
        rank: company.rank || 0,
        name: company.name,
        domain_name: company.domain_name,
        estimated_revenue: company.estimated_revenue || 'Unknown',
        revenue_growth: company.revenue_growth,
        profitability: company.profitability,
        valuation_estimate: company.valuation_estimate,
        employee_count: company.employee_count,
        office_locations: company.office_locations,
        key_clients: company.key_clients,
        average_contract_value: company.average_contract_value,
        leadership: company.leadership,
        primary_domains: company.primary_domains || ['Various consulting services'],
        proprietary_methodologies: company.proprietary_methodologies,
        technology_tools: company.technology_tools,
        competitive_advantage: company.competitive_advantage || 'Specializes in consulting services for enterprise clients',
        merger_synergies: company.merger_synergies,
        cultural_alignment: company.cultural_alignment,
        integration_challenges: company.integration_challenges,
        market_penetration: company.market_penetration || 'Enterprise clients',
        sources: Array.from(new Set([...(company.sources || [])])).filter(Boolean),
        technological_enablement_score: company.technological_enablement_score,
        global_sourcing_reach: company.global_sourcing_reach,
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

  const loadCompaniesFromLocal = () => {
    const mergerResults = JSON.parse(localStorage.getItem(MERGER_STORAGE_KEY) || '{}');
    const searchResults = JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY) || '{}');
    const companyMap = createCompanyDataMapping(mergerResults.results || {}, searchResults);
    return Object.values(companyMap);
  };

  const loadCompaniesFromAPI = async () => {
    try {
      const results = await api.getResults();
      if (results) {
        // Save to localStorage for future use
        localStorage.setItem(MERGER_STORAGE_KEY, JSON.stringify({ results }));
        
        // Process API results to get companies
        const companyMap = createCompanyDataMapping({ results }, {});
        return Object.values(companyMap);
      }
      return [];
    } catch (error) {
      console.error('Error loading companies from API:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        
        // First try to load from API
        let loadedCompanies: CompanyCardProps[] = [];
        try {
          loadedCompanies = await loadCompaniesFromAPI();
        } catch (error) {
          console.error('Error loading from API, falling back to local storage:', error);
        }
        
        // If no API results, try local storage
        if (loadedCompanies.length === 0) {
          loadedCompanies = loadCompaniesFromLocal();
          console.log('Loaded companies from local storage:', loadedCompanies.length);
        }

        setCompanies(loadedCompanies);
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  const handleRedoAllSearch = async () => {
    try {
      setRedoingSearch(true);
      const result = await api.redoSearch();
      
      // Save to localStorage
      localStorage.setItem(MERGER_STORAGE_KEY, JSON.stringify({ results: result.results }));
      
      // Process results to get updated companies
      const companyMap = createCompanyDataMapping({ results: result.results }, {});
      const uniqueCompanies = Object.values(companyMap);
      
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Error redoing search:', error);
    } finally {
      setRedoingSearch(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const openCompanyDetails = (company: CompanyCardProps) => {
    setSelectedCompany(company);
    setOpenDialog(true);
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    // Handle different column types
    let valueA = (a as any)[sortColumn];
    let valueB = (b as any)[sortColumn];
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    // Handle numeric or undefined comparison
    valueA = valueA || 0;
    valueB = valueB || 0;
    
    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const filteredCompanies = searchTerm
    ? sortedCompanies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.primary_domains && Array.isArray(company.primary_domains) && 
          company.primary_domains.some(domain => 
            domain.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ) ||
        (company.competitive_advantage && 
          company.competitive_advantage.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : sortedCompanies;

  // Function to get a sortable header
  const SortableHeader = ({ column, title }: { column: string, title: string }) => (
    <TableHead onClick={() => handleSort(column)} className="cursor-pointer hover:bg-muted">
      <div className="flex items-center gap-1">
        {title}
        <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        {sortColumn === column && (
          <span className="ml-1 text-purple-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  );

  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-opacity-25 border-t-purple-500"></div>
          <p className="mt-2 text-gray-500">Loading companies...</p>
        </div>
      );
    } else if (companies.length === 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700">No companies found</h3>
          <p className="text-gray-500 mt-2">Run search prompts to identify potential merger candidates</p>
        </div>
      );
    } else if (filteredCompanies.length === 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Search size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No matching companies found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
        </div>
      );
    } else {
      return (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableCaption>A list of potential merger candidates ({filteredCompanies.length} companies)</TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <SortableHeader column="rank" title="Rank" />
                <SortableHeader column="name" title="Company" />
                <TableHead>Domains</TableHead>
                <TableHead>Competitive Advantage</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Sources</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.name} className="hover:bg-gray-50/70">
                  <TableCell className="font-medium text-center">
                    {company.rank > 0 ? company.rank : '-'}
                  </TableCell>
                  <TableCell className="font-semibold text-purple-500">
                    {company.name}
                    {company.domain_name && (
                      <div className="text-xs text-blue-500 mt-1">
                        <a 
                          href={`https://${company.domain_name}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline"
                        >
                          {company.domain_name}
                        </a>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {Array.isArray(company.primary_domains) 
                      ? company.primary_domains.join(', ') 
                      : (company.primary_domains || '-')}
                  </TableCell>
                  <TableCell className="max-w-[250px]">{company.competitive_advantage || '-'}</TableCell>
                  <TableCell>{company.market_penetration || '-'}</TableCell>
                  <TableCell>
                    {company.sources && company.sources.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {company.sources.map((source, idx) => {
                          let hostname;
                          try {
                            hostname = new URL(source).hostname;
                          } catch (e) {
                            hostname = source;
                          }
                          return (
                            <a 
                              key={idx} 
                              href={source} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-500 hover:underline text-sm truncate max-w-[150px]"
                            >
                              {hostname}
                            </a>
                          );
                        })}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => openCompanyDetails(company)}
                      className="text-blue-600"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
  };

  return (
    <Layout>
      <LoadingPopup
        isOpen={loading || redoingSearch}
        message={loading ? "Loading Companies" : "Redoing All Searches"}
      />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
          <p className="text-gray-500">
            Browse and filter identified merger candidates ({companies.length} identified)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRedoAllSearch}
            disabled={redoingSearch}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={redoingSearch ? "animate-spin" : ""} />
            Redo All Searches
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Table2 size={16} />
            <span>Table View</span>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by company name, domains, or advantage..."
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

      {renderTableContent()}

      {/* Company Details Dialog */}
      <CompanyDetailsDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        company={selectedCompany} 
      />
    </Layout>
  );
};

export default Companies;