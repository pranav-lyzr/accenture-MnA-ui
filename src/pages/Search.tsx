import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import PromptCard from "../components/search/PromptCard";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { SearchResponse, CompanyDetails } from "../types/search";
import api, { Prompt } from "../services/api";
import LoadingPopup from "../components/ui/LoadingPopup";
import { Button } from "../components/botton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Download } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import * as XLSX from "xlsx";
import CompanyDetailsDialog from "../components/companies/CompanyDetailsDialog";
import ChatDrawer from "../components/chat/ChatDrawer";
import ChatButton from "../components/chat/ChatButton";

// Extend Prompt interface to include agent-ID
interface ExtendedPrompt extends Prompt {
  "agent-ID": string;
}

const STORAGE_KEY = "accenture-search-results";

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
  if (
    response &&
    typeof response === "object" &&
    Array.isArray(response.companies)
  ) {
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
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(() => {
    const savedState = localStorage.getItem("chatDrawerOpen");
    return savedState === null ? false : savedState === "true";
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
  const { toast } = useToast();
  useEffect(() => {
    localStorage.setItem("chatDrawerOpen", chatDrawerOpen.toString());
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
          const savedApiResults =
            (await api.getResults()) as MergerSearchResponse;
          if (
            savedApiResults &&
            Object.keys(savedApiResults.results).length > 0
          ) {
            const formattedResults: { [key: number]: SearchResponse } = {};
            promptsData.forEach((prompt: ExtendedPrompt, index: number) => {
              if (savedApiResults.results[prompt.title]) {
                formattedResults[index] = {
                  title: prompt.title,
                  response: savedApiResults.results[prompt.title].raw_response,
                  companies:
                    savedApiResults.results[prompt.title].extracted_companies,
                  sources: [],
                  validation_warnings:
                    savedApiResults.results[prompt.title].validation_warnings ||
                    [],
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
          console.error("Error fetching results from API:", error);
          const savedLocalResults = localStorage.getItem(STORAGE_KEY);
          if (savedLocalResults) {
            setResults(JSON.parse(savedLocalResults));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
          location: "",
          isOpen: false,
        };
      }
    });
    setRefinementStates(newRefinementStates);
  }, [prompts, results]);

  const handleRunPrompt = async (index: number, customMessage?: string) => {
    try {
      setRunningPrompts((prev) => new Set([...prev, index]));
      const result = (await api.runPrompt(
        index,
        customMessage
      )) as unknown as SearchResponse;

      setResults((prev) => ({
        ...prev,
        [index]: result,
      }));
      setActiveTab(index);
    } catch (error) {
      console.error("Error running prompt:", error);
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
          [key: string]: {
            raw_response: any;
            extracted_companies: CompanyDetails[];
            validation_warnings?: string[];
          };
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
            validation_warnings:
              result.results[prompt.title].validation_warnings || [],
          };
        }
      });

      setResults(formattedResults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedResults));
      if (prompts.length > 0) {
        setActiveTab(prompts[0].index);
      }
    } catch (error) {
      console.error("Error redoing search:", error);
    } finally {
      setRedoingSearch(false);
    }
  };

  const openCompanyDetails = (company: CompanyDetails) => {
    setSelectedCompany(company);
    setOpenDialog(true);
  };

  const handleChatResponseUpdate = (
    index: number,
    response: SearchResponse
  ) => {
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
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
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

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });
  };

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1" />
    );
  };

  const getTableHeaders = (companies: CompanyDetails[]) => {
    if (!companies || companies.length === 0) return [];
    const priorityKeys = [
      "name",
      "domain_name",
      "estimated_revenue",
      "employee_count",
      "Industries",
      "Services",
    ];
    const allKeys = new Set<string>();
    companies.forEach((company) => {
      Object.keys(company).forEach((key) => {
        if (key !== "validation_warnings") {
          allKeys.add(key);
        }
      });
    });
    return [
      ...priorityKeys.filter((key) => allKeys.has(key)),
      ...[...allKeys].filter((key) => !priorityKeys.includes(key)).sort(),
    ];
  };

  const toggleChatDrawer = () => {
    setChatDrawerOpen(!chatDrawerOpen);
  };

  const handleRefine = (index: number) => {
    const state = refinementStates[index];
    if (!state) return;

    const { estimatedRevenue, employeeCount, location } = state;

    // Construct a strict sentence-based prompt for the API
    const messageParts: string[] = [];
    if (estimatedRevenue > 0) {
      messageParts.push(
        `estimated revenue must be strictly below ${estimatedRevenue} million`
      );
    }
    if (employeeCount > 0) {
      messageParts.push(
        `employee count must be strictly below ${employeeCount}`
      );
    }
    if (location.trim() !== "") {
      messageParts.push(`location must be exactly in ${location}`);
    }

    // Create a strict prompt that emphasizes all conditions must be applied
    const customMessage =
      messageParts.length > 0
        ? `Strictly refine the search to only include companies where ${messageParts.join(
            " and "
          )}. Ensure all conditions are applied without exception.`
        : undefined;

    // Only reset the isOpen state and location, keep estimatedRevenue and employeeCount
    setRefinementStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        location: "", // Reset location (if used in the future)
        isOpen: false, // Close the refinement UI
      },
    }));

    // Call the API with the custom message
    handleRunPrompt(index, customMessage);
  };
  // Excel export function for individual tab
  const exportTabToExcel = (tabIndex: number) => {
    try {
      if (
        !results[tabIndex] ||
        !results[tabIndex].companies ||
        results[tabIndex].companies.length === 0
      ) {
        toast({
          title: "No Data",
          description: "No company data available to export for this tab",
          variant: "destructive",
        });
        return;
      }

      const companies = getCompaniesFromResponse(results[tabIndex].response);
      const sortedCompanies = getSortedCompanies(companies);
      const headers = getTableHeaders(companies);

      // Helper function to format cell values consistently with table display
      const formatCellValue = (company: CompanyDetails, key: string) => {
        const value = company[key];

        if (key === "leadership") {
          if (!value || !Array.isArray(value)) return "N/A";
          return value
            .map((leader: any) => `${leader.name} (${leader.title || "N/A"})`)
            .join(", ");
        } else if (key === "sources" && Array.isArray(value)) {
          // return `${value.length} sources`; // Display number of sources
          return value.join(", ") || "N/A";
        } else if (Array.isArray(value)) {
          return value.join(", ") || "N/A";
        } else if (value === undefined || value === null) {
          return "N/A";
        } else if (typeof value === "object") {
          return JSON.stringify(value);
        } else {
          return value.toString();
        }
      };

      // Create Excel data with proper headers and formatted values
      const excelData = sortedCompanies.map((company) => {
        const row: { [key: string]: any } = {};
        headers.forEach((header) => {
          // Convert header to display format (same as table)
          const displayHeader =
            header.replace(/_/g, " ").charAt(0).toUpperCase() +
            header.replace(/_/g, " ").slice(1);
          row[displayHeader] = formatCellValue(company, header);
        });
        return row;
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();

      // Get tab title for sheet name and filename
      const tabTitle = results[tabIndex].title || `Tab_${tabIndex}`;
      let sanitizedTitle = tabTitle.replace(/[^a-zA-Z0-9]/g, "_");
      if (sanitizedTitle.length > 31) {
        sanitizedTitle = sanitizedTitle.substring(0, 31);
      }
      XLSX.utils.book_append_sheet(wb, ws, sanitizedTitle);

      // Auto-adjust column widths
      if (excelData.length > 0) {
        const colWidths = Object.keys(excelData[0]).map((key) => ({
          wch: Math.max(
            key.length,
            ...excelData.map((row: any) => String(row[key] || "").length)
          ),
        }));
        ws["!cols"] = colWidths;
      }

      // Generate filename with tab title and timestamp
      const filename = `${sanitizedTitle}.xlsx`;

      XLSX.writeFile(wb, filename);

      toast({
        title: "Export Successful",
        description: `${sortedCompanies.length} companies exported to ${filename}`,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data to Excel",
        variant: "destructive",
      });
    }
  };
  return (
    <Layout>
      <div
        className={`transition-all duration-300 ${
          chatDrawerOpen ? "pr-[350px] sm:pr-[400px]" : "pr-0"
        }`}
      >
        <LoadingPopup
          isOpen={loading || runningPrompts.size > 0 || redoingSearch}
          message={
            loading
              ? "Loading Search Agents"
              : redoingSearch
              ? "Redoing All Searches"
              : "Running Search Agents"
          }
        />

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Search Agents</h1>
            <p className="text-gray-500">
              Execute search Agents to identify potential merger candidates
            </p>
          </div>
          <Button
            onClick={handleRedoAllSearch}
            disabled={redoingSearch}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw
              size={16}
              className={redoingSearch ? "animate-spin" : ""}
            />
            Redo All Searches
          </Button>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
          <div className="text-blue-500 mr-3 mt-1 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Running Search Agents
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Run individual Agents to explore specific criteria or use the Redo
              All button to regenerate a comprehensive merger candidate report.
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
                agentId={prompt["agent-ID"]}
              />
            ))}
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Search Results
            </h2>
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
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-400"
                      }
                      ${
                        results[prompt.index]
                          ? ""
                          : "opacity-50 cursor-not-allowed"
                      }
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
                    <h3 className="text-lg font-bold text-gray-800">
                      {results[activeTab].title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => exportTabToExcel(activeTab)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={
                          !results[activeTab].companies ||
                          results[activeTab].companies.length === 0
                        }
                      >
                        <Download className="h-4 w-4" />
                        Export Excel
                      </Button>
                      <Button
                        onClick={() => handleRedo(activeTab)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Redo Search
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-500 mt-2">
                    Found {results[activeTab].companies?.length || 0} potential
                    candidates
                  </p>

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
                            value={
                              refinementStates[activeTab]?.estimatedRevenue || 0
                            }
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
                            {refinementStates[activeTab]?.estimatedRevenue || 0}
                            M
                          </span>
                          <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                            Maximum estimated revenue in millions (set to 0 to
                            ignore)
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
                            value={
                              refinementStates[activeTab]?.employeeCount || 0
                            }
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

                {results[activeTab].companies &&
                  results[activeTab].companies.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {getTableHeaders(
                              getCompaniesFromResponse(
                                results[activeTab].response
                              )
                            ).map((header) => (
                              <TableHead
                                key={header}
                                onClick={() => handleSort(header)}
                                className="whitespace-nowrap cursor-pointer hover:bg-gray-100"
                              >
                                {header
                                  .replace(/_/g, " ")
                                  .charAt(0)
                                  .toUpperCase() +
                                  header.replace(/_/g, " ").slice(1)}
                                {renderSortIcon(header)}
                              </TableHead>
                            ))}
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getSortedCompanies(
                            getCompaniesFromResponse(
                              results[activeTab].response
                            )
                          ).map((company, i) => (
                            <TableRow
                              key={i}
                              className="border-b hover:bg-gray-50"
                            >
                              {getTableHeaders(
                                getCompaniesFromResponse(
                                  results[activeTab].response
                                )
                              ).map((key) => (
                                <TableCell key={key} className="align-top py-3">
                                  {(() => {
                                    const value = company[key];
                                    if (key === "name") {
                                      return (
                                        <span className="font-semibold text-gray-900">
                                          {value || "N/A"}
                                        </span>
                                      );
                                    } else if (key === "domain_name" && value) {
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
                                    } else if (key === "leadership") {
                                      if (!value || !Array.isArray(value))
                                        return "N/A";
                                      return value
                                        .map(
                                          (leader: any) =>
                                            `${leader.name} (${
                                              leader.title || "N/A"
                                            })`
                                        )
                                        .join(", ");
                                    } else if (
                                      key === "sources" &&
                                      Array.isArray(value)
                                    ) {
                                      return `${value.length} sources`;
                                    } else if (Array.isArray(value)) {
                                      return value.join(", ") || "N/A";
                                    } else if (
                                      value === undefined ||
                                      value === null
                                    ) {
                                      return "N/A";
                                    } else if (typeof value === "object") {
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

                {results[activeTab].sources &&
                  results[activeTab].sources.length > 0 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Research Sources:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results[activeTab].sources.map((source, i) => {
                          let hostname;
                          try {
                            hostname = new URL(source).hostname.replace(
                              "www.",
                              ""
                            );
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

        <CompanyDetailsDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          company={selectedCompany}
        />

        {!chatDrawerOpen &&
          !(loading || runningPrompts.size > 0 || redoingSearch) && (
            <ChatButton
              onClick={toggleChatDrawer}
              isActive={false}
              isLoading={loading || runningPrompts.size > 0 || redoingSearch}
            />
          )}

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
