import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import PromptCard from "../components/search/PromptCard";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Sliders,
  TrendingUp,
  Building2,
  Search as SearchIcon,
} from "lucide-react";
import { SearchResponse, CompanyDetails } from "../types/search";
import api, { Prompt, PromptHistoryItem, PromptResponse } from "../services/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Extend Prompt interface to include agent-ID
interface ExtendedPrompt extends Prompt {
  "agent-ID": string;
}

const Search = () => {
  const [prompts, setPrompts] = useState<ExtendedPrompt[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redoingSearch, setRedoingSearch] = useState(false);
  const [runningPrompts, setRunningPrompts] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<{ [key: number]: SearchResponse }>({});
  const [selectedHistory, setSelectedHistory] = useState<{
    [key: number]: string | null;
  }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
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
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch prompts
        const promptsData = (await api.getPrompts()) as ExtendedPrompt[];
        setPrompts(promptsData);
        if (promptsData.length > 0) {
          setActiveTab(promptsData[0].index);
        }

        // Fetch prompt history
        const historyData = await api.getPromptHistory();
        setPromptHistory(historyData);

        // Format results from history
        const formattedResults: { [key: number]: SearchResponse } = {};
        const latestHistory: { [key: number]: string } = {};
        promptsData.forEach((prompt) => {
          const promptHistories = historyData.filter(
            (h) => h.prompt_index === prompt.index
          );
          if (promptHistories.length > 0) {
            // Sort by timestamp descending to get the latest
            const latest = promptHistories.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0];
            formattedResults[prompt.index] = {
              title: latest.title,
              response: latest.raw_response,
              companies: latest.raw_response.map((c: CompanyDetails) => c.name), // Map to company names
              sources: latest.raw_response.flatMap((c: CompanyDetails) => c.sources || []),
              validation_warnings: latest.validation_warnings,
              document_id: latest.document_id,
            };
            latestHistory[prompt.index] = latest.timestamp;
          }
        });
        setResults(formattedResults);
        setSelectedHistory(latestHistory);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load prompts or history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize refinement state for each tab when prompts change
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
  }, [prompts]);

  const handleRunPrompt = async (index: number, customMessage?: string) => {
    try {
      setRunningPrompts((prev) => new Set([...prev, index]));
      const result: PromptResponse = await api.runPrompt(index, customMessage);
  
      // Defensive check for raw_response
      if (!result.raw_response || !Array.isArray(result.raw_response)) {
        console.error("Invalid raw_response in API result:", {
          index,
          customMessage,
          result,
        });
        toast({
          title: "Error",
          description: "Invalid response data from server. Please try again.",
          variant: "destructive",
        });
        return;
      }
  
      // Log the result for debugging
      console.debug("runPrompt result:", { index, result });
  
      // Convert PromptResponse to SearchResponse format
      const searchResponse: SearchResponse = {
        title: result.title,
        response: result.raw_response,
        companies: result.raw_response.map((c: CompanyDetails) => c.name || "Unknown"),
        sources: result.sources || result.raw_response.flatMap((c: CompanyDetails) => c.sources || []),
        validation_warnings: result.validation_warnings || [],
        document_id: result.document_id,
      };
  
      // Update results state immediately with runPrompt result
      setResults((prev) => {
        const updated = {
          ...prev,
          [index]: searchResponse,
        };
        console.debug("Updated results state:", { index, updated });
        return updated;
      });
  
      // Reset selected history to ensure latest result is shown
      setSelectedHistory((prev) => {
        const updated = {
          ...prev,
          [index]: null,
        };
        console.debug("Updated selectedHistory state:", { index, updated });
        return updated;
      });
  
      // Set active tab to ensure UI switches to the correct tab
      setActiveTab(index);
      console.debug("Set activeTab:", { index });
  
      // Fetch prompt history to keep dropdown updated, but don't block UI
      const historyData = await api.getPromptHistory();
      setPromptHistory(historyData);
      console.debug("Updated promptHistory:", { historyData });
    } catch (error: any) {
      console.error("Error running prompt:", error, { index, customMessage });
      toast({
        title: "Error",
        description: `Failed to run prompt: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setRunningPrompts((prev) => {
        const updated = new Set([...prev]);
        updated.delete(index);
        return updated;
      });
    }
  };

  const handleRedo = (index: number) => {
    handleRunPrompt(index);
  };

  const handleRedoAllSearch = async () => {
    try {
      setRedoingSearch(true);
      await api.redoSearch();
      // Refresh history
      const historyData = await api.getPromptHistory();
      setPromptHistory(historyData);
      // Update results with latest history
      const formattedResults: { [key: number]: SearchResponse } = {};
      const latestHistory: { [key: number]: string } = {};
      prompts.forEach((prompt) => {
        const promptHistories = historyData.filter(
          (h) => h.prompt_index === prompt.index
        );
        if (promptHistories.length > 0) {
          const latest = promptHistories.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];
          formattedResults[prompt.index] = {
            title: latest.title,
            response: latest.raw_response,
            companies: latest.raw_response.map((c: CompanyDetails) => c.name),
            sources: latest.raw_response.flatMap((c: CompanyDetails) => c.sources || []),
            validation_warnings: latest.validation_warnings,
            document_id: latest.document_id,
          };
          latestHistory[prompt.index] = latest.timestamp;
        }
      });
      setResults(formattedResults);
      setSelectedHistory(latestHistory);
      if (prompts.length > 0) {
        setActiveTab(prompts[0].index);
      }
    } catch (error) {
      console.error("Error redoing search:", error);
      toast({
        title: "Error",
        description: "Failed to redo all searches",
        variant: "destructive",
      });
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
      [index]: {
        ...response,
        companies: response.response.map((c: CompanyDetails) => c.name), // Ensure companies is string[]
      },
    }));
    setSelectedHistory((prev) => ({
      ...prev,
      [index]: null,
    }));
    setActiveTab(index);
    // Refresh history
    api.getPromptHistory().then((historyData) => {
      setPromptHistory(historyData);
    });
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

  const parseRevenue = (revenue: string | undefined): number => {
    if (!revenue) return 0;
    // Remove '$' and 'M', parse to number (assuming revenue is in millions)
    return parseFloat(revenue.replace(/[^0-9.]/g, "")) || 0;
  };

  const parseEmployeeCount = (count: string | undefined): number => {
    if (!count) return 0;
    // Handle both "60" and "2 employees" formats
    const cleaned = count.replace(/[^0-9]/g, "");
    return parseInt(cleaned) || 0;
  };

  const getSortedCompanies = (companies: CompanyDetails[]) => {
    if (!sortConfig) return companies;
    return [...companies].sort((a, b) => {
      if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
      if (!a[sortConfig.key]) return 1;
      if (!b[sortConfig.key]) return -1;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle specific fields for sorting
      if (sortConfig.key === "estimated_revenue") {
        aValue = parseRevenue(aValue as string);
        bValue = parseRevenue(bValue as string);
      } else if (sortConfig.key === "employee_count") {
        aValue = parseEmployeeCount(aValue as string);
        bValue = parseEmployeeCount(bValue as string);
      }

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
      <ArrowUp className="h-4 w-4 inline ml-1 text-indigo-600" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1 text-indigo-600" />
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
      messageParts.push(`estimated revenue must be strictly below $${estimatedRevenue}M`);
    }
    if (employeeCount > 0) {
      messageParts.push(`employee count must be strictly below ${employeeCount}`);
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

    // Reset refinement UI
    setRefinementStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        location: "",
        isOpen: false,
      },
    }));

    // Call the API with the custom message
    handleRunPrompt(index, customMessage);
  };

  // Update handleHistorySelect
  const handleHistorySelect = (index: number, timestamp: string | null) => {
    if (!timestamp || timestamp === "latest") {
      setSelectedHistory((prev) => ({
        ...prev,
        [index]: null,
      }));
      return;
    }
    const historyItem = promptHistory.find(
      (h) => h.prompt_index === index && h.timestamp === timestamp
    );
    if (historyItem) {
      setResults((prev) => ({
        ...prev,
        [index]: {
          title: historyItem.title,
          response: historyItem.raw_response,
          companies: historyItem.raw_response.map((c: CompanyDetails) => c.name),
          sources: historyItem.raw_response.flatMap((c: CompanyDetails) => c.sources || []),
          validation_warnings: historyItem.validation_warnings,
          document_id: historyItem.document_id,
        },
      }));
      setSelectedHistory((prev) => ({
        ...prev,
        [index]: timestamp,
      }));
    }
  };

  // Excel export function for individual tab
  const exportTabToExcel = (tabIndex: number) => {
    try {
      if (
        !results[tabIndex] ||
        !results[tabIndex].response ||
        results[tabIndex].response.length === 0
      ) {
        toast({
          title: "No Data",
          description: "No company data available to export for this tab",
          variant: "destructive",
        });
        return;
      }

      const companies = results[tabIndex].response;
      const sortedCompanies = getSortedCompanies(companies);
      const headers = getTableHeaders(companies);

      const formatCellValue = (company: CompanyDetails, key: string) => {
        const value = company[key];
        if (key === "leadership") {
          if (!value || !Array.isArray(value)) return "N/A";
          return value
            .map((leader: any) => `${leader.name} (${leader.title || "N/A"})`)
            .join(", ");
        } else if (key === "sources" && Array.isArray(value)) {
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

      const excelData = sortedCompanies.map((company) => {
        const row: { [key: string]: any } = {};
        headers.forEach((header) => {
          const displayHeader =
            header.replace(/_/g, " ").charAt(0).toUpperCase() +
            header.replace(/_/g, " ").slice(1);
          row[displayHeader] = formatCellValue(company, header);
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      const tabTitle = results[tabIndex].title || `Tab_${tabIndex}`;
      let sanitizedTitle = tabTitle.replace(/[^a-zA-Z0-9]/g, "_");
      if (sanitizedTitle.length > 31) {
        sanitizedTitle = sanitizedTitle.substring(0, 31);
      }
      XLSX.utils.book_append_sheet(wb, ws, sanitizedTitle);

      if (excelData.length > 0) {
        const colWidths = Object.keys(excelData[0]).map((key) => ({
          wch: Math.max(
            key.length,
            ...excelData.map((row: any) => String(row[key] || "").length)
          ),
        }));
        ws["!cols"] = colWidths;
      }

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

  const totalResults = Object.values(results).reduce(
    (total, result) => total + (result.response?.length || 0),
    0
  );

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

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <SearchIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Search Agents
                  </h1>
                  <p className="text-gray-600 mt-1">
                    AI-powered discovery of potential merger candidates
                  </p>
                </div>
              </div>

              {/* Stats Overview */}
              {totalResults > 0 && (
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">
                      {Object.keys(results).length}
                    </span>
                    <span className="text-gray-600">active searches</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleRedoAllSearch}
              disabled={redoingSearch}
              className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <RefreshCw
                size={18}
                className={redoingSearch ? "animate-spin" : ""}
              />
              Redo All Searches
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                AI-Powered Search Intelligence
              </h3>
              <p className="text-blue-700 leading-relaxed">
                Execute individual search agents to explore specific criteria, or
                use the "Redo All" button to regenerate a comprehensive merger
                candidate report using the latest market intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Search Agents Grid */}
        {loading ? null : prompts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <SearchIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Search Agents Available
              </h3>
              <p className="text-gray-500">
                Configure your search agents to start discovering merger
                candidates.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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

        {/* Results Section */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50">
                <nav className="flex space-x-1 p-1 overflow-x-auto">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt.index}
                      onClick={() => setActiveTab(prompt.index)}
                      className={`
                        px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap
                        ${
                          activeTab === prompt.index
                            ? "bg-white text-indigo-600 shadow-sm border border-indigo-100"
                            : "text-gray-600 hover:text-indigo-600 hover:bg-white/50"
                        }
                        ${results[prompt.index] ? "" : "opacity-50 cursor-not-allowed"}
                      `}
                      disabled={!results[prompt.index]}
                    >
                      {prompt.title}
                      {results[prompt.index] && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                          {results[prompt.index].response?.length || 0}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Active Tab Content */}
              {activeTab !== null && results[activeTab] && (
                <div className="p-6">
                  {/* Tab Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{results[activeTab].title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {results[activeTab].response?.length || 0} companies found
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={selectedHistory[activeTab] || "latest"}
                        onValueChange={(value) => handleHistorySelect(activeTab, value === "latest" ? null : value)}
                      >
                        <SelectTrigger className="w-[220px] bg-white border-gray-200 hover:border-indigo-300 focus:border-indigo-500">
                          <SelectValue placeholder="Select history" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="latest" className="font-medium">Latest Result</SelectItem>
                          {promptHistory
                            .filter((h) => h.prompt_index === activeTab)
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((history) => (
                              <SelectItem key={history.timestamp} value={history.timestamp} className="text-sm">
                                {new Date(history.timestamp).toLocaleString()}{" "}
                                {history.custom_message && (
                                  <span className="text-gray-500 ml-2" title={history.custom_message}>
                                    - {history.custom_message.substring(0, 30)}...
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => exportTabToExcel(activeTab)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        disabled={!results[activeTab].response || results[activeTab].response.length === 0}
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button
                        onClick={() => handleRedo(activeTab)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Redo
                      </Button>
                    </div>
                  </div>

                  {/* Refinement Controls */}
                  <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
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
                      className="flex items-center gap-3 text-emerald-800 font-medium mb-3 focus:outline-none group"
                    >
                      <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors duration-200">
                        <Sliders size={18} />
                      </div>
                      <span>Refine Search Parameters</span>
                      <ArrowDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          refinementStates[activeTab]?.isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {refinementStates[activeTab]?.isOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-white rounded-lg border border-emerald-100">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            Max Revenue (M)
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
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
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                            <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                              {refinementStates[activeTab]?.estimatedRevenue || 0}M
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-emerald-600" />
                            Max Employees
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
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
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                            <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                              {refinementStates[activeTab]?.employeeCount || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => handleRefine(activeTab)}
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm py-2.5 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Apply Refinements
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results Table */}
                  {results[activeTab].response && results[activeTab].response.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              {getTableHeaders(results[activeTab].response).map((header) => (
                                <TableHead
                                  key={header}
                                  onClick={() => handleSort(header)}
                                  className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4"
                                >
                                  <div className="flex items-center gap-1">
                                    {header.replace(/_/g, " ").charAt(0).toUpperCase() + header.replace(/_/g, " ").slice(1)}
                                    {renderSortIcon(header)}
                                  </div>
                                </TableHead>
                              ))}
                              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getSortedCompanies(results[activeTab].response).map((company, i) => (
                              <TableRow key={i} className="border-b hover:bg-gray-50 transition-colors duration-150">
                                {getTableHeaders(results[activeTab].response).map((key) => (
                                  <TableCell key={key} className="align-top py-4 text-sm">
                                    {(() => {
                                      const value: any = company[key];
                                      if (key === "name") {
                                        return <span className="font-semibold text-gray-900">{value || "N/A"}</span>;
                                      } else if (key === "domain_name" && value) {
                                        return (
                                          <a
                                            href={`${value}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                                          >
                                            {value}
                                          </a>
                                        );
                                      } else if (key === "leadership") {
                                        if (!value || !Array.isArray(value)) return <span className="text-gray-400">N/A</span>;
                                        return (
                                          <div className="space-y-1">
                                            {value.slice(0, 2).map((leader: { name: string; title?: string }, idx: number) => (
                                              <div key={idx} className="text-sm">
                                                <span className="font-medium">{leader.name}</span>
                                                {leader.title && <span className="text-gray-500 ml-1">({leader.title})</span>}
                                              </div>
                                            ))}
                                            {value.length > 2 && (
                                              <span className="text-xs text-gray-400">+{value.length - 2} more</span>
                                            )}
                                          </div>
                                        );
                                      } else if (key === "sources" && Array.isArray(value)) {
                                        return (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs text-blue-800">
                                            {value.length} sources
                                          </span>
                                        );
                                      } else if (Array.isArray(value)) {
                                        return value.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {value.slice(0, 3).map((item: string, idx: number) => (
                                              <span
                                                key={idx}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs text-gray-700"
                                              >
                                                {item}
                                              </span>
                                            ))}
                                            {value.length > 3 && (
                                              <span className="text-xs text-gray-400">+{value.length - 3} more</span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">N/A</span>
                                        );
                                      } else if (value === undefined || value === null) {
                                        return <span className="text-gray-400">N/A</span>;
                                      } else if (typeof value === "object") {
                                        return <span className="text-xs text-gray-500">{JSON.stringify(value)}</span>;
                                      } else {
                                        return <span className="text-gray-900">{value.toString()}</span>;
                                      }
                                    })()}
                                  </TableCell>
                                ))}
                                <TableCell className="py-4">
                                  <Button
                                    onClick={() => openCompanyDetails(company)}
                                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 text-sm px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium"
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                  
                </div>
              )}
              {activeTab !== null && results[activeTab] && (!results[activeTab].response || results[activeTab].response.length === 0) && (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-500">No results available for this search.</p>
                </div>
              )}
            </div>
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