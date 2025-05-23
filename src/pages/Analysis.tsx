import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { Button } from '../components/botton';
import api from '../services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import CompanyManager from '../components/companies/CompanyManager';
import RankedAnalysisTab from '../components/analysis/RankedAnalysisTab';
import { CompanyStatus } from "../types/company";

interface CompanyCardProps {
  rank?: number;
  name: string;
  domain_name?: string;
  estimated_revenue?: string;
  revenue?: string;
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
  headquarters?: string;
  location?: string;
  specialization?: string | string[];
  specializations?: string | string[];
  primary_focus?: string;
  Industries?: string | string[];
  industry?: string | string[];
  status?: "shortlisted" | "rejected" | "pending";
  notes?: string;
  timestamp?: number;
}

const MERGER_STORAGE_KEY = 'accenture-merger-results';
const SEARCH_STORAGE_KEY = 'accenture-search-results';
const STATUS_STORAGE_KEY = 'shortlisted-companies';

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any | null>(null);
  const [companies, setCompanies] = useState<CompanyCardProps[]>([]);

  // Utility function to normalize company data from different response formats
  const getCompaniesFromResponse = (response: any): any[] => {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object' && Array.isArray(response.companies)) {
      return response.companies;
    }
    return [];
  };

  const loadCompaniesFromLocal = () => {
    const mergerResults = JSON.parse(localStorage.getItem(MERGER_STORAGE_KEY) || '{}');
    const searchResults = JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY) || '{}');
    const savedStatus = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}') as CompanyStatus;

    const consolidatedCompanies: CompanyCardProps[] = [];
    [mergerResults.results || {}, searchResults].forEach((data: any) => {
      if (data) {
        Object.values(data).forEach((section: any) => {
          const companies = getCompaniesFromResponse(section.response || section.raw_response);
          consolidatedCompanies.push(...companies);
        });
      }
    });

    // Merge with status data
    const uniqueCompanies = Array.from(
      new Map(consolidatedCompanies.map(item => [item.name, item])).values()
    );

    return uniqueCompanies.map(company => ({
      ...company,
      status: savedStatus[company.name]?.status || "pending",
      notes: savedStatus[company.name]?.notes,
      timestamp: savedStatus[company.name]?.timestamp || Date.now(),
    }));
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const fetchedResults = await api.getResults();
      setResults(fetchedResults);
      console.log(results)
      const savedStatus = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}') as CompanyStatus;
      const consolidatedCompanies: CompanyCardProps[] = [];
      Object.entries(fetchedResults.results || {}).forEach(([key, value]: [string, any]) => {
        if (key !== 'claude_analysis' && (value.response || value.raw_response)) {
          const companies = getCompaniesFromResponse(value.response || value.raw_response);
          consolidatedCompanies.push(...companies);
        }
      });

      // Remove duplicates and merge with status
      const uniqueCompanies = Array.from(
        new Map(consolidatedCompanies.map(item => [item.name, item])).values()
      ).map(company => ({
        ...company,
        status: savedStatus[company.name]?.status || "pending",
        notes: savedStatus[company.name]?.notes,
        timestamp: savedStatus[company.name]?.timestamp || Date.now(),
      }));

      if (uniqueCompanies.length === 0) {
        console.warn('No companies found in API response, trying local storage');
        const localCompanies = loadCompaniesFromLocal();
        setCompanies(localCompanies);
        if (localCompanies.length === 0) {
          console.log("No companies found in API response or local storage. Please run a search.");
        } else {
          console.log(`Loaded ${localCompanies.length} companies from local storage.`);
        }
      } else {
        setCompanies(uniqueCompanies);
        localStorage.setItem(MERGER_STORAGE_KEY, JSON.stringify({ results: fetchedResults }));
      }
    } catch (error) {
      console.error('Failed to load company data:', error);
      const localCompanies = loadCompaniesFromLocal();
      setCompanies(localCompanies);
      console.log(localCompanies.length > 0
        ? `Loaded ${localCompanies.length} companies from local storage.`
        : "Failed to load company data and no local data available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleStatusUpdate = (updatedStatus: CompanyStatus) => {
    console.log('Received status update:', updatedStatus);
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(updatedStatus));
    setCompanies(prevCompanies => {
      const updatedCompanies = prevCompanies.map(company => {
        const newStatus = updatedStatus[company.name];
        if (
          newStatus &&
          (company.status !== newStatus.status ||
           company.notes !== newStatus.notes ||
           company.timestamp !== newStatus.timestamp)
        ) {
          return {
            ...company,
            status: newStatus.status,
            notes: newStatus.notes,
            timestamp: newStatus.timestamp,
          };
        }
        return company;
      });
      return JSON.stringify(updatedCompanies) !== JSON.stringify(prevCompanies)
        ? updatedCompanies
        : prevCompanies;
    });
  };

  const handleDownloadJSON = () => {
    api.downloadJSON();
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      const results = await api.redoSearch();
      setResults(results);
      const savedStatus = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}') as CompanyStatus;
      const consolidatedCompanies: CompanyCardProps[] = [];
      Object.entries(results.results || {}).forEach(([key, value]: [string, any]) => {
        if (key !== 'claude_analysis' && (value.response || value.raw_response)) {
          const companies = getCompaniesFromResponse(value.response || value.raw_response);
          consolidatedCompanies.push(...companies);
        }
      });

      const uniqueCompanies = Array.from(
        new Map(consolidatedCompanies.map(item => [item.name, item])).values()
      ).map(company => ({
        ...company,
        status: savedStatus[company.name]?.status || "pending",
        notes: savedStatus[company.name]?.notes,
        timestamp: savedStatus[company.name]?.timestamp || Date.now(),
      }));

      if (uniqueCompanies.length === 0) {
        console.warn('No companies found in refreshed API response, trying local storage');
        const localCompanies = loadCompaniesFromLocal();
        setCompanies(localCompanies);
        if (localCompanies.length === 0) {
          console.log("No companies found after refreshing. Please try again.");
        } else {
          console.log(`Loaded ${localCompanies.length} companies from local storage.`);
        }
      } else {
        setCompanies(uniqueCompanies);
        localStorage.setItem(MERGER_STORAGE_KEY, JSON.stringify({ results }));
        console.log(`Data refreshed with ${uniqueCompanies.length} companies.`);
      }
    } catch (error) {
      console.error('Failed to refresh company data:', error);
      const localCompanies = loadCompaniesFromLocal();
      setCompanies(localCompanies);
      console.log(localCompanies.length > 0
        ? `Loaded ${localCompanies.length} companies from local storage.`
        : "Error refreshing data and no local data available.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to categorize revenue (already defined)
  const categorizeRevenue = (revenue: string): string => {
    if (!revenue || revenue === 'Unknown') return 'Unknown';

    const numericString = revenue.toLowerCase().replace(/[^0-9.]/g, '');
    const value = parseFloat(numericString);

    if (isNaN(value)) return 'Unknown';

    const isMillions = revenue.toLowerCase().includes('m') || revenue.toLowerCase().includes('million');
    const adjustedValue = isMillions ? value : value / 1000000;

    if (adjustedValue < 5) return 'Under $5M';
    if (adjustedValue < 10) return '$5M - $10M';
    if (adjustedValue < 20) return '$10M - $20M';
    if (adjustedValue < 50) return '$20M - $50M';
    return 'Over $50M';
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Company Analysis</h1>
          <p className="text-gray-500">Evaluate and shortlist potential acquisition candidates</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDownloadJSON}
          >
            <Download className="h-4 w-4" />
            <span>Download Data</span>
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={handleRefreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
        <div>
          <h2 className="font-medium text-lg">Company Shortlisting</h2>
          <p className="text-gray-500 text-sm">Found {companies.length} potential acquisition candidates</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accenture-purple border-opacity-25 border-t-accenture-purple"></div>
          <p className="mt-2 text-gray-500">Loading company data...</p>
        </div>
      ) : companies.length > 0 ? (
        <Tabs defaultValue="shortlist" className="space-y-4">
          <TabsList>
            <TabsTrigger value="shortlist">Shortlist Companies</TabsTrigger>
            <TabsTrigger value="overview">Companies Overview</TabsTrigger>
            <TabsTrigger value="ranked">Ranked Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="shortlist" className="space-y-4">
            <CompanyManager companies={companies} onStatusUpdate={handleStatusUpdate} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="mr-2 text-accenture-purple" size={24} />
                Companies Overview
              </h2>
              <Tabs defaultValue="headquarters">
                <TabsList className="mb-4">
                  <TabsTrigger value="headquarters">By Headquarters</TabsTrigger>
                  <TabsTrigger value="revenue">By Revenue</TabsTrigger>
                  <TabsTrigger value="specialization">By Specialization</TabsTrigger>
                  <TabsTrigger value="industry">By Industry</TabsTrigger>
                </TabsList>
                <TabsContent value="headquarters">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(companies.reduce((acc: { [key: string]: string[] }, company) => {
                      const location = company.headquarters || company.location || 'Unknown';
                      if (!acc[location]) acc[location] = [];
                      acc[location].push(company.name);
                      return acc;
                    }, {})).map(([location, companies]) => (
                      <div key={location} className="border rounded-md p-4">
                        <h3 className="font-medium text-gray-800 mb-2">{location} ({companies.length})</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {companies.map((company, i) => (
                            <li key={i} className="text-gray-600">{company}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="revenue">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(companies.reduce((acc: { [key: string]: string[] }, company) => {
                      const revenue = company.revenue || company.estimated_revenue || 'Unknown';
                      const range = categorizeRevenue(revenue);
                      if (!acc[range]) acc[range] = [];
                      acc[range].push(company.name);
                      return acc;
                    }, {})).map(([range, companies]) => (
                      <div key={range} className="border rounded-md p-4">
                        <h3 className="font-medium text-gray-800 mb-2">{range} ({companies.length})</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {companies.map((company, i) => (
                            <li key={i} className="text-gray-600">{company}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="specialization">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(companies.reduce((acc: { [key: string]: string[] }, company) => {
                      const specs = company.specialization || company.specializations || [company.primary_focus || 'General'];
                      const specList = Array.isArray(specs) ? specs : [specs];
                      specList.forEach(spec => {
                        const specName = spec || 'General';
                        if (!acc[specName]) acc[specName] = [];
                        acc[specName].push(company.name);
                      });
                      return acc;
                    }, {})).map(([spec, companies]) => (
                      <div key={spec} className="border rounded-md p-4">
                        <h3 className="font-medium text-gray-800 mb-2">{spec} ({companies.length})</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {companies.map((company, i) => (
                            <li key={i} className="text-gray-600">{company}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="industry">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(companies.reduce((acc: { [key: string]: string[] }, company) => {
                      const industries = company.Industries || company.industry || ['Retail'];
                      const industryList = Array.isArray(industries) ? industries : [industries];
                      industryList.forEach(industry => {
                        const industryName = industry || 'General';
                        if (!acc[industryName]) acc[industryName] = [];
                        acc[industryName].push(company.name);
                      });
                      return acc;
                    }, {})).map(([industry, companies]) => (
                      <div key={industry} className="border rounded-md p-4">
                        <h3 className="font-medium text-gray-800 mb-2">{industry} ({companies.length})</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {companies.map((company, i) => (
                            <li key={i} className="text-gray-600">{company}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="ranked" className="space-y-4">
            <RankedAnalysisTab companies={companies} categorizeRevenue={categorizeRevenue} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <FileText size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No Companies Available</h3>
          <p className="text-gray-500 mt-2">Run the search to fetch potential acquisition candidates</p>
          <Button
            className="mt-4 bg-accenture-purple hover:bg-accenture-lightPurple"
            onClick={handleRefreshData}
          >
            Run Search
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Analysis;