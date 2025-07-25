import { useState, useMemo } from "react";
import {
  Search,
  CheckSquare,
  Square,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "../botton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface CompanyCardProps {
  name: string;
  office_locations?: string[];
  estimated_revenue?: string;
  revenue?: string;
  Industries?: string | string[];
  industry?: string | string[];
  status?: "shortlisted" | "rejected" | "pending";
}

interface Filters {
  office_locations: string[];
  revenue: string;
  industry: string;
}

interface CompanySelectionProps {
  companies: CompanyCardProps[];
  filters: Filters;
  selectedCompanies: string[];
  onSelectCompanies: (selected: string[]) => void;
  onFilterChange: (filters: Filters) => void;
  categorizeRevenue: (revenue: string) => string;
}

// Add CompanyFilters component inline
const CompanyFilters = ({
  companies,
  onFilterChange,
  categorizeRevenue,
}: {
  companies: CompanyCardProps[];
  onFilterChange: (filters: Filters) => void;
  categorizeRevenue: (revenue: string) => string;
}) => {
  const [filters, setFilters] = useState<Filters>({
    office_locations: [],
    revenue: "All",
    industry: "All",
  });

  // Extract unique filter options
  const allLocationOptions = [
    ...new Set(
      companies
        .flatMap((c) => c.office_locations || ["Unknown"])
        .filter((location) => location)
    ),
  ].sort();

  const locationOptions = allLocationOptions.filter(
    (location) => !filters.office_locations.includes(location)
  );

  const revenueOptions = [
    "All",
    "Under $5M",
    "$5M - $10M",
    "$10M - $20M",
    "$20M - $50M",
    "Over $50M",
  ];
  const industryOptions = [
    "All",
    ...new Set(
      companies.flatMap((c) => {
        const industries = c.Industries || c.industry || ["General"];
        return Array.isArray(industries) ? industries : [industries];
      })
    ),
  ];

  const handleFilterChange = (key: keyof Filters, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocation = e.target.value;
    if (
      selectedLocation &&
      !filters.office_locations.includes(selectedLocation)
    ) {
      const newLocations = [...filters.office_locations, selectedLocation];
      handleFilterChange("office_locations", newLocations);
    }
    e.target.value = "";
  };

  const removeLocation = (location: string) => {
    const newLocations = filters.office_locations.filter(
      (loc) => loc !== location
    );
    handleFilterChange("office_locations", newLocations);
  };

  const clearFilters = () => {
    const newFilters = {
      office_locations: [],
      revenue: "All",
      industry: "All",
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="location-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Office Locations
        </label>
        <select
          id="location-filter"
          onChange={handleLocationChange}
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-200"
          defaultValue=""
        >
          <option value="" disabled>
            Select a location
          </option>
          {locationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.office_locations.length > 0 ? (
            filters.office_locations.map((location) => (
              <span
                key={location}
                className="inline-flex items-center bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {location}
                <button
                  onClick={() => removeLocation(location)}
                  className="ml-2 focus:outline-none"
                  aria-label={`Remove ${location}`}
                >
                  ✕
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">
              No locations selected.
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="revenue-filter"
          className="block text-sm font-medium text-gray-700 mb-1 border-gray-200"
        >
          Revenue Range
        </label>
        <select
          id="revenue-filter"
          value={filters.revenue}
          onChange={(e) => handleFilterChange("revenue", e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {revenueOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="industry-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Industry Type
        </label>
        <select
          id="industry-filter"
          value={filters.industry}
          onChange={(e) => handleFilterChange("industry", e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {industryOptions.map((option) => (
            <option key={option} value={option} className="border-gray-200">
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="text-gray-600 border-gray-300 hover:bg-gray-100 mb-7"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

const CompanySelection = ({
  companies,
  filters,
  selectedCompanies,
  onSelectCompanies,
  onFilterChange,
  categorizeRevenue,
}: CompanySelectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filter and search companies
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        // Office locations filter
        const locations = company.office_locations || ["Unknown"];
        const locationMatch =
          filters.office_locations.length === 0 ||
          filters.office_locations.some((selectedLocation) =>
            locations.includes(selectedLocation)
          );

        // Revenue filter
        const revenue =
          company.estimated_revenue || company.revenue || "Unknown";
        const revenueRange = categorizeRevenue(revenue);
        const revenueMatch =
          filters.revenue === "All" || revenueRange === filters.revenue;

        // Industry filter
        const industries = company.Industries ||
          company.industry || ["General"];
        const industryList = Array.isArray(industries)
          ? industries
          : [industries];
        const industryMatch =
          filters.industry === "All" || industryList.includes(filters.industry);

        // Search term filter
        const searchMatch = company.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return locationMatch && revenueMatch && industryMatch && searchMatch;
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;

        let valueA: any = a[sortConfig.key as keyof CompanyCardProps] || "";
        let valueB: any = b[sortConfig.key as keyof CompanyCardProps] || "";

        if (sortConfig.key === "office_locations") {
          const locationA = a.office_locations?.[0] || "Unknown";
          const locationB = b.office_locations?.[0] || "Unknown";
          valueA = locationA;
          valueB = locationB;
        } else if (sortConfig.key === "estimated_revenue") {
          valueA = categorizeRevenue(
            a.estimated_revenue || a.revenue || "Unknown"
          );
          valueB = categorizeRevenue(
            b.estimated_revenue || b.revenue || "Unknown"
          );
        } else if (sortConfig.key === "Industries") {
          valueA = (a.Industries || a.industry || ["General"]).toString();
          valueB = (b.Industries || b.industry || ["General"]).toString();
        }

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortConfig.direction === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return sortConfig.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      });
  }, [companies, filters, searchTerm, sortConfig, categorizeRevenue]);

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCompanies.slice(start, start + rowsPerPage);
  }, [filteredCompanies, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);

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

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 inline ml-1 text-indigo-600" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1 text-indigo-600" />
    );
  };

  const handleSelect = (companyName: string) => {
    const newSelection = selectedCompanies.includes(companyName)
      ? selectedCompanies.filter((name) => name !== companyName)
      : [...selectedCompanies, companyName];
    onSelectCompanies(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      onSelectCompanies([]);
    } else {
      onSelectCompanies(filteredCompanies.map((c) => c.name));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    const tableElement = document.querySelector("[data-table-container]");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <Users className="h-4 w-4" />
              <span>{filteredCompanies.length} companies found</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CompanyFilters
          companies={companies}
          onFilterChange={onFilterChange}
          categorizeRevenue={categorizeRevenue}
        />

        {/* Selection Summary */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Selection Summary
                </p>
                <p className="text-purple-700">
                  {selectedCompanies.length} of {companies.length} companies
                  selected for analysis
                </p>
              </div>
            </div>
            {selectedCompanies.length > 0 && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {selectedCompanies.length} selected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div data-table-container>
        {filteredCompanies.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Enhanced Top Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 sm:mb-0">
                  <span className="font-medium">
                    Showing {(currentPage - 1) * rowsPerPage + 1}-
                    {Math.min(
                      currentPage * rowsPerPage,
                      filteredCompanies.length
                    )}{" "}
                    of {filteredCompanies.length} companies
                  </span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto max-h-[600px]">
              <Table className="w-full">
                <TableHeader className="bg-gray-50 sticky top-0 z-50 border-b border-gray-200">
                  <TableRow className="border-gray-200">
                    <TableHead className="w-12">
                      <button
                        onClick={handleSelectAll}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {selectedCompanies.length ===
                        filteredCompanies.length ? (
                          <CheckSquare size={20} className="text-purple-600" />
                        ) : (
                          <Square size={20} className="text-gray-400" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("name")}
                      className="cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Company Name
                              {renderSortIcon("name")}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Company Name</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("office_locations")}
                      className="cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Locations
                              {renderSortIcon("office_locations")}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Office Locations</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("estimated_revenue")}
                      className="cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Revenue Range
                              {renderSortIcon("estimated_revenue")}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Revenue Range</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("Industries")}
                      className="cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-semibold text-gray-900 py-4 bg-gray-50"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 truncate">
                              Industry
                              {renderSortIcon("Industries")}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Industry</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 py-4 bg-gray-50">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.map((company, index) => (
                    <TableRow
                      key={company.name}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
                        selectedCompanies.includes(company.name)
                          ? "bg-purple-50 border-l-4 border-l-purple-500"
                          : ""
                      }`}
                      onClick={() => handleSelect(company.name)}
                    >
                      <TableCell>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(company.name);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {selectedCompanies.includes(company.name) ? (
                            <CheckSquare
                              size={20}
                              className="text-purple-600"
                            />
                          ) : (
                            <Square size={20} className="text-gray-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
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
                              <span className="text-gray-900 truncate block">
                                {(company.office_locations?.length ?? 0) > 0
                                  ? company.office_locations
                                      ?.slice(0, 2)
                                      .join(", ") +
                                    (company.office_locations!.length > 2
                                      ? ` +${
                                          company.office_locations!.length - 2
                                        }`
                                      : "")
                                  : "Unknown"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {(company.office_locations?.length ?? 0) > 0
                                  ? company.office_locations?.join(", ")
                                  : "Unknown"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate block">
                                {categorizeRevenue(
                                  company.estimated_revenue ||
                                    company.revenue ||
                                    "Unknown"
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {categorizeRevenue(
                                  company.estimated_revenue ||
                                    company.revenue ||
                                    "Unknown"
                                )}
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
                                {(
                                  company.Industries ||
                                  company.industry || ["General"]
                                )
                                  .toString()
                                  .split(",")
                                  .slice(0, 2)
                                  .join(", ")}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {(
                                  company.Industries ||
                                  company.industry || ["General"]
                                )
                                  .toString()
                                  .split(",")
                                  .join(", ")}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm max-w-[170px] bg-white">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  company.status === "shortlisted"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : company.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {company.status || "pending"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.status || "pending"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Bottom Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 sm:mb-0">
                  <span className="font-medium">
                    Page {currentPage} of {totalPages} (
                    {filteredCompanies.length} total companies)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof page === "number" && handlePageChange(page)
                        }
                        disabled={page === "..."}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          page === currentPage
                            ? "bg-gray-600 text-white shadow-md"
                            : page === "..."
                            ? "text-gray-400 cursor-default"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Matching Companies
            </h3>
            <p className="text-gray-500">
              Adjust your filters or search term to find companies
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySelection;
