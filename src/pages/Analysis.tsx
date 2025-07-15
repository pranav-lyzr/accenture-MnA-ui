
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { FileText, Loader2, RefreshCw, TrendingUp, Users, MapPin, ChartCandlestick } from 'lucide-react';
import { Button } from '../components/botton';
import api from '../services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import CompanyManager from '../components/companies/CompanyManager';
import RankedAnalysisTab from '../components/analysis/RankedAnalysisTab';
import { CompanyStatus } from "../types/company";

interface CompanyCardProps {
  _id: string;
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

const STATUS_STORAGE_KEY = 'shortlisted-companies';

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyCardProps[]>([]);

  // Fetch companies directly from the company API
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const companiesData = await api.getCompanies();
      const savedStatus = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}') as CompanyStatus;
      const companiesWithStatus = companiesData.map(company => ({
        ...company,
        _id: company._id, // <-- ensure _id is present
        status: savedStatus[company.name]?.status || "pending",
        notes: savedStatus[company.name]?.notes,
        timestamp: savedStatus[company.name]?.timestamp || Date.now(),
      }));
      setCompanies(companiesWithStatus);
    } catch (error) {
      console.error('Failed to load company data:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle status updates with memoization and deep comparison to prevent unnecessary updates
  const handleStatusUpdate = useCallback((updatedStatus: CompanyStatus) => {
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

      // Deep comparison to avoid unnecessary state updates
      const hasChanged = updatedCompanies.some((company, index) => {
        const prev = prevCompanies[index];
        return (
          company.status !== prev.status ||
          company.notes !== prev.notes ||
          company.timestamp !== prev.timestamp
        );
      });

      return hasChanged ? updatedCompanies : prevCompanies;
    });
  }, []); // Empty deps since no external dependencies are used

  // Handle data refresh
  const handleRefreshData = async () => {
    try {
      setLoading(true);
      await api.redoSearch();
      const companiesData = await api.getCompanies();
      const savedStatus = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}') as CompanyStatus;
      const companiesWithStatus = companiesData.map(company => ({
        ...company,
        _id: company._id, // <-- ensure _id is present
        status: savedStatus[company.name]?.status || "pending",
        notes: savedStatus[company.name]?.notes,
        timestamp: savedStatus[company.name]?.timestamp || Date.now(),
      }));
      setCompanies(companiesWithStatus);
    } catch (error) {
      console.error('Failed to refresh company data:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to categorize revenue
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
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-xl">
            <ChartCandlestick className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Company Analysis
            </h1>
            <p className="text-gray-600 mt-1">
            Evaluate and shortlist potential acquisition candidates
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Total Companies</p>
                <p className="text-2xl font-bold text-emerald-900">{companies.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Shortlisted</p>
                <p className="text-2xl font-bold text-blue-900">
                  {companies.filter(c => c.status === 'shortlisted').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Locations</p>
                <p className="text-2xl font-bold text-amber-900">
                  {new Set(companies.map(c => c.office_locations || c.location || 'Unknown')).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Loading Company Data</h3>
                <p className="text-gray-500">Please wait while we fetch the latest information...</p>
              </div>
            </div>
          </div>
        ) : companies.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <Tabs defaultValue="shortlist" className="w-full">
              <div className="border-b border-gray-200 px-6">
                <TabsList className="bg-transparent h-auto p-0 space-x-8">
                  <TabsTrigger 
                    value="shortlist" 
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-purple-600 font-medium"
                  >
                    Shortlist Companies
                  </TabsTrigger>
                  <TabsTrigger 
                    value="overview" 
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-purple-600 font-medium"
                  >
                    Companies Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ranked" 
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-purple-600 font-medium"
                  >
                    Ranked Analysis
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="shortlist" className="p-6">
                <CompanyManager companies={companies} onStatusUpdate={handleStatusUpdate} />
              </TabsContent>

              <TabsContent value="overview" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Companies Overview</h2>
                      <p className="text-gray-500">Analyze companies by different dimensions</p>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="headquarters" className="w-full">
                    <TabsList className="bg-gray-100 p-1 rounded-xl">
                      <TabsTrigger value="headquarters" className="rounded-lg px-4 py-2">By Headquarters</TabsTrigger>
                      <TabsTrigger value="revenue" className="rounded-lg px-4 py-2">By Revenue</TabsTrigger>
                      <TabsTrigger value="specialization" className="rounded-lg px-4 py-2">By Specialization</TabsTrigger>
                      <TabsTrigger value="industry" className="rounded-lg px-4 py-2">By Industry</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="headquarters" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(companies.reduce((acc: { [key: string]: string[] }, company) => {
                          const location = company.headquarters || company.location || 'Unknown';
                          if (!acc[location]) acc[location] = [];
                          acc[location].push(company.name);
                          return acc;
                        }, {})).map(([location, companies]) => (
                          <div key={location} className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">{location}</h3>
                              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                                {companies.length}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {companies.slice(0, 3).map((company, i) => (
                                <div key={i} className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 shadow-sm">
                                  {company}
                                </div>
                              ))}
                              {companies.length > 3 && (
                                <div className="text-xs text-gray-500 text-center py-1">
                                  +{companies.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="revenue" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(companies.reduce((acc: { [key: string]: string[] }, company) => {
                          const revenue = company.revenue || company.estimated_revenue || 'Unknown';
                          const range = categorizeRevenue(revenue);
                          if (!acc[range]) acc[range] = [];
                          acc[range].push(company.name);
                          return acc;
                        }, {})).map(([range, companies]) => (
                          <div key={range} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">{range}</h3>
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                                {companies.length}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {companies.slice(0, 3).map((company, i) => (
                                <div key={i} className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 shadow-sm">
                                  {company}
                                </div>
                              ))}
                              {companies.length > 3 && (
                                <div className="text-xs text-gray-500 text-center py-1">
                                  +{companies.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="specialization" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          <div key={spec} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">{spec}</h3>
                              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                                {companies.length}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {companies.slice(0, 3).map((company, i) => (
                                <div key={i} className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 shadow-sm">
                                  {company}
                                </div>
                              ))}
                              {companies.length > 3 && (
                                <div className="text-xs text-gray-500 text-center py-1">
                                  +{companies.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="industry" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          <div key={industry} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">{industry}</h3>
                              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                                {companies.length}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {companies.slice(0, 3).map((company, i) => (
                                <div key={i} className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 shadow-sm">
                                  {company}
                                </div>
                              ))}
                              {companies.length > 3 && (
                                <div className="text-xs text-gray-500 text-center py-1">
                                  +{companies.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="ranked" className="p-6">
                <RankedAnalysisTab companies={companies} categorizeRevenue={categorizeRevenue} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-12 text-center border border-gray-200/60">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Companies Available</h3>
            <p className="text-gray-500 mb-6">Run the search to fetch potential acquisition candidates</p>
            <Button
              onClick={handleRefreshData}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Search
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analysis;