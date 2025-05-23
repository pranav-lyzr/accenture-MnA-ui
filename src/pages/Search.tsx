import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PromptCard from '../components/search/PromptCard';
import { AlertCircle, ArrowDown, ArrowUp, RefreshCw, Sliders } from 'lucide-react';
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
} from '../components/ui/table';
import CompanyDetailsDialog from '../components/companies/CompanyDetailsDialog';
import ChatDrawer from '../components/chat/ChatDrawer';
import ChatButton from '../components/chat/ChatButton';

// Extend Prompt interface to include agent-ID
interface ExtendedPrompt extends Prompt {
  'agent-ID': string;
}

const STORAGE_KEY = 'accenture-search-results';

interface MergerSearchResponse {
  results: {
    [key: string]: {
      raw_response: any;
      extracted_companies: CompanyDetails[];
      validation_warnings?: string[];
    };
  };
}

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
  const [prompts, setPrompts] = useState<ExtendedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [redoingSearch, setRedoingSearch] = useState(false);
  const [runningPrompts, setRunningPrompts] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<{ [key: number]: SearchResponse }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(() => {
    const savedState = localStorage.getItem('chatDrawerOpen');
    return savedState === null ? false : savedState === 'true';
  });
  const [activeTab, setActiveTab] = useState<number | null>(null);

  // State for refinement controls (per tab)
  const [refinementStates, setRefinementStates] = useState<{
    [key: number]: {
      estimatedRevenue: number;
      employeeCount: number;
      location: string;
      isOpen: boolean;
    };
  }>({});

  useEffect(() => {
    localStorage.setItem('chatDrawerOpen', chatDrawerOpen.toString());
  }, [chatDrawerOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const promptsData = (await api.getPrompts()) as ExtendedPrompt[];
        setPrompts(promptsData);
        if (promptsData.length > 0) {
          setActiveTab(promptsData[0].index);
        }

        try {
          const savedApiResults = (await api.getResults()) as MergerSearchResponse;
          if (savedApiResults && Object.keys(savedApiResults.results).length > 0) {
            const formattedResults: { [key: number]: SearchResponse } = {};
            promptsData.forEach((prompt: ExtendedPrompt, index: number) => {
              if (savedApiResults.results[prompt.title]) {
                formattedResults[index] = {
                  title: prompt.title,
                  response: savedApiResults.results[prompt.title].raw_response,
                  companies: savedApiResults.results[prompt.title].extracted_companies,
                  sources: [],
                  validation_warnings: savedApiResults.results[prompt.title].validation_warnings || [],
                };
              }
            });
            setResults(formattedResults);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedResults));
          } else {
            const savedLocalResults = localStorage.getItem(STORAGE_KEY);
            if (savedLocalResults) {
              setResults(JSON.parse(savedLocalResults));
            }
          }
        } catch (error) {
          console.error('Error fetching results from API:', error);
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

  useEffect(() => {
    if (Object.keys(results).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    }
  }, [results]);

  // Initialize refinement state for each tab when results change
  useEffect(() => {
    const newRefinementStates = { ...refinementStates };
    prompts.forEach((prompt) => {
      if (!newRefinementStates[prompt.index]) {
        newRefinementStates[prompt.index] = {
          estimatedRevenue: 0,
          employeeCount: 0,
          location: '',
          isOpen: false,
        };
      }
    });
    setRefinementStates(newRefinementStates);
  }, [prompts, results]);

  const handleRunPrompt = async (index: number, customMessage?: string) => {
    try {
      setRunningPrompts((prev) => new Set([...prev, index]));
      const result = (await api.runPrompt(index, customMessage)) as unknown as SearchResponse;

      setResults((prev) => ({
        ...prev,
        [index]: result,
      }));
      setActiveTab(index);
    } catch (error) {
      console.error('Error running prompt:', error);
    } finally {
      setRunningPrompts((prev) => {
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
    setActiveTab(index);
    handleRunPrompt(index);
  };

  const handleRedoAllSearch = async () => {
    try {
      setRedoingSearch(true);
      const result = (await api.redoSearch()) as {
        results: {
          [key: string]: { raw_response: any; extracted_companies: CompanyDetails[]; validation_warnings?: string[] };
        };
      };

      const formattedResults: { [key: number]: SearchResponse } = {};
      prompts.forEach((prompt: ExtendedPrompt, index: number) => {
        if (result.results[prompt.title]) {
          formattedResults[index] = {
            title: prompt.title,
            response: result.results[prompt.title].raw_response,
            companies: result.results[prompt.title].extracted_companies,
            sources: [],
            validation_warnings: result.results[prompt.title].validation_warnings || [],
          };
        }
      });

      setResults(formattedResults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedResults));
      if (prompts.length > 0) {
        setActiveTab(prompts[0].index);
      }
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
    setResults((prev) => ({
      ...prev,
      [index]: response,
    }));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...results,
        [index]: response,
      })
    );
    setActiveTab(index);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedCompanies = (companies: CompanyDetails[]) => {
    if (!sortConfig) return companies;
    return [...companies].sort((a, b) => {
      if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
      if (!a[sortConfig.key]) return 1;
      if (!b[sortConfig.key]) return -1;

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
    });
  };

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1" />
    );
  };

  const getTableHeaders = (companies: CompanyDetails[]) => {
    if (!companies || companies.length === 0) return [];
    const priorityKeys = ['name', 'domain_name', 'estimated_revenue', 'employee_count', 'Industries', 'Services'];
    const allKeys = new Set<string>();
    companies.forEach((company) => {
      Object.keys(company).forEach((key) => {
        if (key !== 'validation_warnings') {
          allKeys.add(key);
        }
      });
    });
    return [...priorityKeys.filter((key) => allKeys.has(key)), ...[...allKeys].filter((key) => !priorityKeys.includes(key)).sort()];
  };

  const toggleChatDrawer = () => {
    setChatDrawerOpen(!chatDrawerOpen);
  };

  const handleRefine = (index: number) => {
    const state = refinementStates[index];
    if (!state) return;

    const { estimatedRevenue, employeeCount, location } = state;

    // Construct the custom message based on the refinement inputs
    const messageParts: string[] = [];
    if (estimatedRevenue > 0) {
      messageParts.push(`estimated revenue above ${estimatedRevenue}M`);
    }
    if (employeeCount > 0) {
      messageParts.push(`employee count below ${employeeCount}`);
    }
    if (location.trim() !== '') {
      messageParts.push(`located in ${location}`);
    }

    const customMessage = messageParts.length > 0 ? `Refine search to companies with ${messageParts.join(', ')}.` : undefined;

    // Reset refinement inputs after submission
    setRefinementStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        estimatedRevenue: 0,
        employeeCount: 0,
        location: '',
        isOpen: false,
      },
    }));

    // Call the API with the custom message
    handleRunPrompt(index, customMessage);
  };

  return (
    <Layout>
      <div className={`transition-all duration-300 ${chatDrawerOpen ? 'pr-[350px] sm:pr-[400px]' : 'pr-0'}`}>
        <LoadingPopup
          isOpen={loading || runningPrompts.size > 0 || redoingSearch}
          message={loading ? 'Loading Search Agents' : redoingSearch ? 'Redoing All Searches' : 'Running Search Agents'}
        />

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Search Agents</h1>
            <p className="text-gray-500">Execute search Agents to identify potential merger candidates</p>
          </div>
          <Button
            onClick={handleRedoAllSearch}
            disabled={redoingSearch}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw size={16} className={redoingSearch ? 'animate-spin' : ''} />
            Redo All Searches
          </Button>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
          <div className="text-blue-500 mr-3 mt-1 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Running Search Agents</h3>
            <p className="text-sm text-blue-600 mt-1">
              Run individual Agents to explore specific criteria or use the Redo All button to regenerate a comprehensive merger
              candidate report.
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
                agentId={prompt['agent-ID']}
              />
            ))}
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Search Results</h2>
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-1 whitespace-nowrap">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.index}
                    onClick={() => setActiveTab(prompt.index)}
                    className={`
                      px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2
                      ${
                        activeTab === prompt.index
                          ? 'border-purple-600 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-400'
                      }
                      ${results[prompt.index] ? '' : 'opacity-50 cursor-not-allowed'}
                    `}
                    disabled={!results[prompt.index]}
                  >
                    {prompt.title}
                  </button>
                ))}
              </nav>
            </div>

            {activeTab !== null && results[activeTab] && (
              <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{results[activeTab].title}</h3>
                    <Button
                      onClick={() => handleRedo(activeTab)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Redo Search
                    </Button>
                  </div>
                  <p className="text-gray-500 mt-2">Found {results[activeTab].companies?.length || 0} potential candidates</p>

                  {/* Refinement UI */}
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-4">
                    <button
                      onClick={() =>
                        setRefinementStates((prev) => ({
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            isOpen: !prev[activeTab]?.isOpen,
                          },
                        }))
                      }
                      className="flex items-center gap-2 text-green-800 font-medium text-sm mb-1 focus:outline-none"
                    >
                      <Sliders size={20} />
                      Refine Search Parameters
                    </button>

                    {refinementStates[activeTab]?.isOpen && (
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Estimated Revenue Slider */}
                        <div className="relative group flex items-center gap-2">
                          <label
                            htmlFor={`estimated-revenue-${activeTab}`}
                            className="text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Revenue (M):
                          </label>
                          <input
                            type="range"
                            id={`estimated-revenue-${activeTab}`}
                            min="0"
                            max="500"
                            step="10"
                            value={refinementStates[activeTab]?.estimatedRevenue || 0}
                            onChange={(e) =>
                              setRefinementStates((prev) => ({
                                ...prev,
                                [activeTab]: {
                                  ...prev[activeTab],
                                  estimatedRevenue: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                          />
                          <span className="text-sm text-gray-600">
                            {refinementStates[activeTab]?.estimatedRevenue || 0}M
                          </span>
                          <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                            Minimum estimated revenue in millions (set to 0 to ignore)
                          </span>
                        </div>

                        {/* Employee Count Slider */}
                        <div className="relative group flex items-center gap-2">
                          <label
                            htmlFor={`employee-count-${activeTab}`}
                            className="text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Max Employees:
                          </label>
                          <input
                            type="range"
                            id={`employee-count-${activeTab}`}
                            min="0"
                            max="1000"
                            step="10"
                            value={refinementStates[activeTab]?.employeeCount || 0}
                            onChange={(e) =>
                              setRefinementStates((prev) => ({
                                ...prev,
                                [activeTab]: {
                                  ...prev[activeTab],
                                  employeeCount: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                          />
                          <span className="text-sm text-gray-600">
                            {refinementStates[activeTab]?.employeeCount || 0}
                          </span>
                          <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                            Maximum number of employees (set to 0 to ignore)
                          </span>
                        </div>

                        {/* Location Text Field */}
                        {/* <div className="relative group flex items-center gap-2">
                          <label
                            htmlFor={`location-${activeTab}`}
                            className="text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Location:
                          </label>
                          <input
                            type="text"
                            id={`location-${activeTab}`}
                            value={refinementStates[activeTab]?.location || ''}
                            onChange={(e) =>
                              setRefinementStates((prev) => ({
                                ...prev,
                                [activeTab]: {
                                  ...prev[activeTab],
                                  location: e.target.value,
                                },
                              }))
                            }
                            placeholder="e.g., USA"
                            className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm"
                          />
                          <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                            Enter the location to filter companies (leave blank to ignore)
                          </span>
                        </div> */}

                        {/* Refine Button */}
                        <button
                          onClick={() => handleRefine(activeTab)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-4 rounded-md"
                        >
                          Refine
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {results[activeTab].companies && results[activeTab].companies.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {getTableHeaders(getCompaniesFromResponse(results[activeTab].response)).map((header) => (
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
                        {getSortedCompanies(getCompaniesFromResponse(results[activeTab].response)).map((company, i) => (
                          <TableRow key={i} className="border-b hover:bg-gray-50">
                            {getTableHeaders(getCompaniesFromResponse(results[activeTab].response)).map((key) => (
                              <TableCell key={key} className="align-top py-3">
                                {(() => {
                                  const value = company[key];
                                  if (key === 'name') {
                                    return <span className="font-semibold text-gray-900">{value || 'N/A'}</span>;
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
                                    return value.map((leader: any) => `${leader.name} (${leader.title || 'N/A'})`).join(', ');
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
                                className="text-blue-600 hover:bg-blue-50"
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

                {results[activeTab].sources && results[activeTab].sources.length > 0 && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Research Sources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {results[activeTab].sources.map((source, i) => {
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
            )}
          </div>
        )}

        <CompanyDetailsDialog open={openDialog} onOpenChange={setOpenDialog} company={selectedCompany} />

        {!chatDrawerOpen && <ChatButton onClick={toggleChatDrawer} isActive={false} />}

        <ChatDrawer
          open={chatDrawerOpen}
          onOpenChange={setChatDrawerOpen}
          agentIndexes={prompts}
          onResponseUpdate={handleChatResponseUpdate}
          activeTab={activeTab}
        />
      </div>
    </Layout>
  );
};

export default Search;