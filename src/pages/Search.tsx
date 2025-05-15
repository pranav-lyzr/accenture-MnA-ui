
import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PromptCard from '../components/search/PromptCard';
import { AlertCircle, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { SearchResponse, CompanyDetails } from '../types/search';
import api, { Prompt } from '../services/api';
import LoadingPopup from '../components/ui/LoadingPopup';
import { Button } from '../components/botton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import CompanyDetailsDialog from '../components/companies/CompanyDetailsDialog';
import ChatDrawer from '../components/chat/ChatDrawer';
import ChatButton from '../components/chat/ChatButton';

const STORAGE_KEY = 'accenture-search-results';

// Define type for API response to allow string indexing
interface MergerSearchResponse {
  results: {
    [key: string]: {
      raw_response: any;
      extracted_companies: CompanyDetails[];
      validation_warnings?: string[];
    };
  };
}

// Utility function to get companies from response
const getCompaniesFromResponse = (response: any): CompanyDetails[] => {
  if (Array.isArray(response)) {
    return response as CompanyDetails[];
  }
  if (response && typeof response === 'object' && Array.isArray(response.companies)) {
    return response.companies as CompanyDetails[];
  }
  return [];
};

const Search = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [redoingSearch, setRedoingSearch] = useState(false);
  const [runningPrompts, setRunningPrompts] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<{ [key: number]: SearchResponse }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(() => {
    // Check if the chat drawer was previously open
    const savedState = localStorage.getItem('chatDrawerOpen');
    // Return true if it was explicitly saved as "true", otherwise default to false for new sessions
    return savedState === null ? false : savedState === 'true';
  });
  
  useEffect(() => {
    localStorage.setItem('chatDrawerOpen', chatDrawerOpen.toString());
  }, [chatDrawerOpen]);
  
  // Load existing results from API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch prompts
        const promptsData = await api.getPrompts();
        setPrompts(promptsData);
        
        // Try to fetch saved results from API
        try {
          const savedApiResults = await api.getResults() as MergerSearchResponse;
          if (savedApiResults && Object.keys(savedApiResults.results).length > 0) {
            // Format API results to match our state structure
            const formattedResults: { [key: number]: SearchResponse } = {};
            promptsData.forEach((prompt: Prompt, index: number) => {
              if (savedApiResults.results[prompt.title]) {
                formattedResults[index] = {
                  title: prompt.title,
                  response: savedApiResults.results[prompt.title].raw_response,
                  companies: savedApiResults.results[prompt.title].extracted_companies,
                  sources: [],
                  validation_warnings: savedApiResults.results[prompt.title].validation_warnings || []
                };
              }
            });
            setResults(formattedResults);
            // Save to localStorage as well
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedResults));
          } else {
            // If no API results, try to use localStorage results
            const savedLocalResults = localStorage.getItem(STORAGE_KEY);
            if (savedLocalResults) {
              setResults(JSON.parse(savedLocalResults));
            }
          }
        } catch (error) {
          console.error('Error fetching results from API:', error);
          // Fallback to localStorage if API fails
          const savedLocalResults = localStorage.getItem(STORAGE_KEY);
          if (savedLocalResults) {
            setResults(JSON.parse(savedLocalResults));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save results to localStorage when they change
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    }
  }, [results]);

  const handleRunPrompt = async (index: number) => {
    try {
      setRunningPrompts(prev => new Set([...prev, index]));
      const result = (await api.runPrompt(index) as unknown) as SearchResponse;

      setResults(prev => ({
        ...prev,
        [index]: result,
      }));

    } catch (error) {
      console.error('Error running prompt:', error);
    } finally {
      setRunningPrompts(prev => {
        const updated = new Set([...prev]);
        updated.delete(index);
        return updated;
      });
    }
  };

  const handleRedo = (index: number) => {
    const newResults = { ...results };
    delete newResults[index];
    setResults(newResults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newResults));
    
    handleRunPrompt(index);
  };

  const handleRedoAllSearch = async () => {
    try {
      setRedoingSearch(true);
      const result = await api.redoSearch() as { results: { [key: string]: { raw_response: any; extracted_companies: CompanyDetails[]; validation_warnings?: string[] } } };
      
      // Format API results to match our state structure
      const formattedResults: { [key: number]: SearchResponse } = {};
      prompts.forEach((prompt: Prompt, index: number) => {
        if (result.results[prompt.title]) {
          formattedResults[index] = {
            title: prompt.title,
            response: result.results[prompt.title].raw_response,
            companies: result.results[prompt.title].extracted_companies,
            sources: [],
            validation_warnings: result.results[prompt.title].validation_warnings || []
          };
        }
      });
      
      setResults(formattedResults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedResults));
      
    } catch (error) {
      console.error('Error redoing search:', error);
    } finally {
      setRedoingSearch(false);
    }
  };

  const openCompanyDetails = (company: CompanyDetails) => {
    setSelectedCompany(company);
    setOpenDialog(true);
  };

  const handleChatResponseUpdate = (index: number, response: SearchResponse) => {
    setResults(prev => ({
      ...prev,
      [index]: response,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...results,
      [index]: response,
    }));
  };

  // Handle sorting for table columns
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Get sorted companies data
  const getSortedCompanies = (companies: CompanyDetails[]) => {
    if (!sortConfig) return companies;
    
    return [...companies].sort((a, b) => {
      if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
      if (!a[sortConfig.key]) return 1;
      if (!b[sortConfig.key]) return -1;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
  };

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 inline ml-1" /> : <ArrowDown className="h-4 w-4 inline ml-1" />;
  };

  // Function to get all available keys from companies for table headers
  const getTableHeaders = (companies: CompanyDetails[]) => {
    if (!companies || companies.length === 0) return [];
    
    // Priority keys that should appear first in the table
    const priorityKeys = ['name', 'domain_name', 'estimated_revenue', 'employee_count', 'Industries', 'Services'];
    
    // Get all unique keys from all companies
    const allKeys = new Set<string>();
    companies.forEach(company => {
      Object.keys(company).forEach(key => {
        // Skip validation warnings, we'll display them separately
        if (key !== 'validation_warnings') {
          allKeys.add(key);
        }
      });
    });
    
    // Sort keys with priority keys first, then alphabetically
    return [...priorityKeys.filter(key => allKeys.has(key)), 
            ...[...allKeys].filter(key => !priorityKeys.includes(key)).sort()];
  };

  const toggleChatDrawer = () => {
    setChatDrawerOpen(!chatDrawerOpen);
  };

  return (
    <Layout>
      <div
        className={`transition-all duration-300 ${
          chatDrawerOpen ? 'pr-[350px] sm:pr-[400px]' : 'pr-0'
        }`}
      >
        <LoadingPopup
          isOpen={loading || runningPrompts.size > 0 || redoingSearch}
          message={loading ? "Loading Search Agents" : (redoingSearch ? "Redoing All Searches" : "Running Search Agents")}
        />
  
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Search Agents</h1>
            <p className="text-gray-500">Execute search Agents to identify potential merger candidates</p>
          </div>
          
          <Button 
            onClick={handleRedoAllSearch}
            disabled={redoingSearch}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={redoingSearch ? "animate-spin" : ""} />
            Redo All Searches
          </Button>
        </div>
  
        {/* Rest of the existing JSX remains unchanged */}
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
          <div className="text-blue-500 mr-3 mt-1 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Running Search Agents</h3>
            <p className="text-sm text-blue-600 mt-1">
              Run individual Agents to explore specific criteria or use the Redo All button
              to regenerate a comprehensive merger candidate report.
            </p>
          </div>
        </div>
  
        {loading ? null : prompts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No search Agents available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.index}
                index={prompt.index}
                title={prompt.title}
                isRunning={runningPrompts.has(prompt.index)}
                hasResults={!!results[prompt.index]}
                onRun={handleRunPrompt}
              />
            ))}
          </div>
        )}
  
        {Object.keys(results).length > 0 && (
          <div className="mt-8 space-y-8">
            <h2 className="text-xl font-bold text-gray-800">Search Results</h2>
            {Object.entries(results).map(([index, result]) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{result.title}</h3>
                    <Button
                      onClick={() => handleRedo(Number(index))}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Phosph Search
                    </Button>
                  </div>
                  <p className="text-gray-500 mt-2">Found {result.companies?.length || 0} potential candidates</p>
                </div>
                
                {result.companies && result.companies.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {getTableHeaders(getCompaniesFromResponse(result.response)).map((header) => (
                            <TableHead 
                              key={header} 
                              onClick={() => handleSort(header)} 
                              className="whitespace-nowrap cursor-pointer hover:bg-gray-100"
                            >
                              {header.replace(/_/g, ' ').charAt(0).toUpperCase() + header.replace(/_/g, ' ').slice(1)}
                              {renderSortIcon(header)}
                            </TableHead>
                          ))}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      
                      <TableBody>
                        {getSortedCompanies(getCompaniesFromResponse(result.response)).map((company, i) => (
                          <TableRow key={i} className="border-b hover:bg-gray-50">
                            {getTableHeaders(getCompaniesFromResponse(result.response)).map((key) => (
                              <TableCell key={key} className="align-top py-3">
                                {(() => {
                                  const value = company[key];
                                  if (key === 'name') {
                                    return (
                                      <span className="font-semibold text-gray-900">
                                        {value || 'N/A'}
                                      </span>
                                    );
                                  } else if (key === 'domain_name' && value) {
                                    return (
                                      <a 
                                        href={`https://${value}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {value}
                                      </a>
                                    );
                                  } else if (key === 'leadership') {
                                    if (!value || !Array.isArray(value)) return 'N/A';
                                    return value.map((leader: any) => 
                                      `${leader.name} (${leader.title || 'N/A'})`
                                    ).join(', ');
                                  } else if (key === 'sources' && Array.isArray(value)) {
                                    return `${value.length} sources`;
                                  } else if (Array.isArray(value)) {
                                    return value.join(', ') || 'N/A';
                                  } else if (value === undefined || value === null) {
                                    return 'N/A';
                                  } else if (typeof value === 'object') {
                                    return JSON.stringify(value);
                                  } else {
                                    return value.toString();
                                  }
                                })()}
                              </TableCell>
                            ))}
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
                )}
  
                {result.sources && result.sources.length > 0 && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Research Sources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((source, i) => {
                        let hostname;
                        try {
                          hostname = new URL(source).hostname.replace('www.', '');
                        } catch (e) {
                          hostname = source;
                        }
                        return (
                          <a
                            key={i}
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            {hostname}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
  
        {/* Company Details Dialog */}
        <CompanyDetailsDialog 
          open={openDialog} 
          onOpenChange={setOpenDialog} 
          company={selectedCompany} 
        />
  
        {/* Chat Button - only show when drawer is closed */}
        {!chatDrawerOpen && 
          <ChatButton 
            onClick={toggleChatDrawer}
            isActive={false}
          />
        }
  
        {/* Chat Drawer */}
        <ChatDrawer 
          open={chatDrawerOpen}
          onOpenChange={setChatDrawerOpen}
          agentIndexes={prompts}
          onResponseUpdate={handleChatResponseUpdate}
        />
      </div>
    </Layout>
  );
};

export default Search;