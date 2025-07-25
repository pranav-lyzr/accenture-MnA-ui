/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import {
  Search,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/botton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import LoadingPopup from "../components/ui/LoadingPopup";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

// Interface aligned with the /company API response
interface CompanyCardProps {
  _id: string;
  name: string;
  "Broad Category": string;
  Industries: string;
  Ownership: string;
  Services: string;
  domain_name: string;
  employee_count: string;
  estimated_revenue: string;
  key_clients: string[];
  leadership: { name: string; title: string }[];
  merger_synergies: string;
  office_locations: string[];
  revenue_growth: string;
  sources: string[];
  validation_warnings: string[];
}

const Companies = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("name"); // Default sort by name
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Fetch companies directly from the /company API on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const companiesData = await api.getCompanies();
        setCompanies(companiesData as CompanyCardProps[]);
      } catch (error) {
        console.error("Error loading companies:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  // Sort table columns
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Open company details page
  const openCompanyDetails = (company: CompanyCardProps) => {
    navigate(`/company/${company._id}`);
  };

  // Generate and download Excel file using API data
  const handleDownloadExcel = () => {
    const excelData = filteredCompanies.map((company) => ({
      Company: company.name || "-",
      Domain: company.domain_name || "-",
      "Estimated Revenue": company.estimated_revenue || "-",
      "Employee Count": company.employee_count || "-",
      Industries: company.Industries || "-",
      Services: company.Services || "-",
      Ownership: company.Ownership || "-",
      "Key Clients": Array.isArray(company.key_clients)
        ? company.key_clients.join(", ")
        : "-",
      Leadership: Array.isArray(company.leadership)
        ? company.leadership.map((l) => `${l.name} (${l.title})`).join(", ")
        : "-",
      "Merger Synergies": company.merger_synergies || "-",
      "Office Locations": Array.isArray(company.office_locations)
        ? company.office_locations.join(", ")
        : "-",
      "Revenue Growth": company.revenue_growth || "-",
      Sources: Array.isArray(company.sources)
        ? company.sources.join(", ")
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet["!cols"] = [
      { wch: 30 }, // Company
      { wch: 20 }, // Domain
      { wch: 20 }, // Estimated Revenue
      { wch: 15 }, // Employee Count
      { wch: 30 }, // Industries
      { wch: 30 }, // Services
      { wch: 15 }, // Ownership
      { wch: 30 }, // Key Clients
      { wch: 40 }, // Leadership
      { wch: 40 }, // Merger Synergies
      { wch: 30 }, // Office Locations
      { wch: 20 }, // Revenue Growth
      { wch: 50 }, // Sources
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");
    XLSX.writeFile(workbook, "Companies.xlsx");
  };

  // Sort companies based on selected column and direction
  const sortedCompanies = [...companies].sort((a, b) => {
    let valueA = (a as any)[sortColumn];
    let valueB = (b as any)[sortColumn];
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    valueA = valueA || 0;
    valueB = valueB || 0;
    return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
  });

  // Filter companies based on search term using available fields
  const filteredCompanies = searchTerm
    ? sortedCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (company.Industries &&
            company.Industries.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (company.Services &&
            company.Services.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (company.merger_synergies &&
            company.merger_synergies
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    : sortedCompanies;

  // Pagination calculations
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Render sortable table header
  const SortableHeader = ({
    column,
    title,
    className = "",
  }: {
    column: string;
    title: string;
    className?: string;
  }) => (
    <TableHead
      onClick={() => handleSort(column)}
      className={`cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0 ${className}`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 truncate">
              {title}
              <ArrowUpDown size={14} className="ml-1 text-gray-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableHead>
  );

  // Render table content
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
          <h3 className="text-lg font-medium text-gray-700">
            No companies found
          </h3>
          <p className="text-gray-500 mt-2">No company data available</p>
        </div>
      );
    } else if (filteredCompanies.length === 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Search size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">
            No matching companies found
          </h3>
          <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
        </div>
      );
    } else {
      return (
        <div className="flex-1 flex flex-col">
          {/* Table Container */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex-1">
            <div className="overflow-auto h-full">
              <Table className="w-full">
                <TableHeader className="bg-gray-50 sticky top-0 z-50 border-b border-gray-200">
                  <TableRow className="border-gray-200">
                    <SortableHeader
                      column="name"
                      title="Company"
                      className="sticky left-0 z-60 shadow-[2px_0_5px_rgba(0,0,0,0.1)]"
                    />
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Domain
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Domain</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Estimated Revenue
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Estimated Revenue</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Employee Count
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Employee Count</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Industries
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Industries</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Services
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Services</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Ownership
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ownership</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Key Clients
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Key Clients</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Leadership
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Leadership</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Merger Synergies
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Merger Synergies</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Office Locations
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Office Locations</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Revenue Growth
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Revenue Growth</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Sources
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sources</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50 max-w-[170px] sticky top-0 sticky right-0 z-60 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Actions
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Actions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCompanies.map((company) => (
                    <TableRow
                      key={company._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <TableCell className="align-top py-4 text-sm max-w-[170px] sticky left-0 z-40 bg-gray-50 shadow-[4px_0_8px_rgba(0,0,0,0.15)]">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-semibold text-gray-900 truncate block">
                                {company.name || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.name || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={`https://${company.domain_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium truncate block"
                              >
                                {company.domain_name || "N/A"}
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.domain_name || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-900 truncate block">
                                {company.estimated_revenue || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.estimated_revenue || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-900 truncate block">
                                {company.employee_count || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.employee_count || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-900 truncate block">
                                {company.Industries || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.Industries || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-900 truncate block">
                                {company.Services || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.Services || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-900 truncate block">
                                {company.Ownership || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.Ownership || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-[170px]">
                                <div className="text-sm truncate">
                                  {Array.isArray(company.key_clients) &&
                                  company.key_clients.length > 0 ? (
                                    <>
                                      <span className="text-gray-700">
                                        {company.key_clients[0]}
                                      </span>
                                      {company.key_clients.length > 1 && (
                                        <span className="text-xs text-gray-400 ml-1">
                                          +{company.key_clients.length - 1} more
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-400">N/A</span>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {Array.isArray(company.key_clients)
                                  ? company.key_clients.join(", ")
                                  : "N/A"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-[170px]">
                                <div className="text-sm truncate">
                                  {Array.isArray(company.leadership) &&
                                  company.leadership.length > 0 ? (
                                    <>
                                      <span>
                                        <span className="font-medium">
                                          {company.leadership[0].name}
                                        </span>
                                        {company.leadership[0].title && (
                                          <span className="text-gray-500 ml-1">
                                            ({company.leadership[0].title})
                                          </span>
                                        )}
                                      </span>
                                      {company.leadership.length > 1 && (
                                        <span className="text-xs text-gray-400 ml-1">
                                          +{company.leadership.length - 1} more
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-400">N/A</span>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {Array.isArray(company.leadership)
                                  ? company.leadership
                                      .map((l) => `${l.name} (${l.title})`)
                                      .join(", ")
                                  : "N/A"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-900 truncate block">
                                {company.merger_synergies || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.merger_synergies || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-900 truncate block">
                                {Array.isArray(company.office_locations)
                                  ? company.office_locations.join(", ")
                                  : "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {Array.isArray(company.office_locations)
                                  ? company.office_locations.join(", ")
                                  : "N/A"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-900 truncate block">
                                {company.revenue_growth || "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.revenue_growth || "N/A"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-[170px]">
                                <div className="text-sm truncate">
                                  {Array.isArray(company.sources) &&
                                  company.sources.length > 0 ? (
                                    <>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs text-blue-800 truncate">
                                        {company.sources.length} sources
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-gray-400">N/A</span>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {Array.isArray(company.sources)
                                  ? company.sources.join(", ")
                                  : "N/A"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white sticky right-0 z-40 shadow-[-4px_0_8px_rgba(0,0,0,0.15)]">
                        <Button
                          onClick={() => openCompanyDetails(company)}
                          size="sm"
                          className="text-blue-600 text-xs px-2 py-1 whitespace-nowrap"
                          variant="secondary"
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

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredCompanies.length)} of{" "}
                {filteredCompanies.length} results
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">Rows per page:</p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={i}
                        variant={
                          pageNumber === currentPage ? "secondary" : "outline"
                        }
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="p-6 h-full flex flex-col">
        <LoadingPopup isOpen={loading} message="Loading Companies" />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
            <p className="text-gray-500">
              Browse and filter identified merger candidates ({companies.length}{" "}
              identified)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2"
              variant="secondary"
            >
              <Download size={16} />
              Download as Excel
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by company name, industries, services, or synergies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col">{renderTableContent()}</div>
      </div>
    </Layout>
  );
};

export default Companies;
