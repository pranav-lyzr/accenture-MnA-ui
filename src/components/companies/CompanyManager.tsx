import React, { useState, useEffect } from "react";
import { Check, X, List, FileText, Search, Filter } from "lucide-react";
import { Button } from "../botton";
import { Input } from "../ui/input";
import { ShortlistedCompany, CompanyStatus } from "../../types/company";
import CompanyActionCard from "./CompanyActionCard";
import { useNavigate } from "react-router-dom";

const LOCAL_STORAGE_KEY = "shortlisted-companies";

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

interface CompanyManagerProps {
  companies: CompanyCardProps[];
  onStatusUpdate?: (status: CompanyStatus) => void;
}

const CompanyManager: React.FC<CompanyManagerProps> = ({ companies, onStatusUpdate }) => {
  const [companyStatus, setCompanyStatus] = useState<CompanyStatus>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "shortlisted" | "rejected" | "pending"
  >("all");

  const [sortBy, setSortBy] = useState<"name" | "status" | "updated">("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();

  // Load saved status from localStorage
  useEffect(() => {
    const savedStatus = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedStatus) {
      setCompanyStatus(JSON.parse(savedStatus));
    }
  }, []);

  // Initialize company statuses, preserving existing ones
  useEffect(() => {
    if (companies.length > 0) {
      const updatedStatus = { ...companyStatus };

      companies.forEach((company) => {
        const companyId = company.name; // Use name as ID
        const existingStatus = updatedStatus[companyId];

        const newStatus: ShortlistedCompany = {
          id: companyId,
          name: company.name,
          status: company.status || existingStatus?.status || "pending",
          details: {
            revenue: company.revenue || company.estimated_revenue,
            employee_count: company.employee_count
              ? parseInt(company.employee_count, 10)
              : existingStatus?.details.employee_count,
            specialization: Array.isArray(company.specialization)
              ? company.specialization.join(", ")
              : company.specialization ||
                (Array.isArray(company.specializations)
                  ? company.specializations.join(", ")
                  : company.specializations) ||
                company.primary_focus ||
                existingStatus?.details.specialization,
            domain_name: company.domain_name,
            primary_domains: company.primary_domains,
            competitive_advantage: company.competitive_advantage,
            market_penetration: company.market_penetration,
            sources: company.sources,
            headquarters: company.headquarters || company.location,
            industry: Array.isArray(company.Industries)
              ? company.Industries.join(", ")
              : company.Industries || company.industry,
          },
          timestamp: company.timestamp || existingStatus?.timestamp || Date.now(),
          notes: company.notes || existingStatus?.notes,
        };

        // Only update if status has changed to prevent infinite loop
        if (
          !existingStatus ||
          JSON.stringify(existingStatus) !== JSON.stringify(newStatus)
        ) {
          updatedStatus[companyId] = newStatus;
        }
      });

      // Only update state if there are changes
      if (JSON.stringify(updatedStatus) !== JSON.stringify(companyStatus)) {
        console.log('Updating companyStatus:', updatedStatus);
        setCompanyStatus(updatedStatus);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedStatus));
        onStatusUpdate?.(updatedStatus);
      }
    }
  }, [companies]);

  // Update localStorage and notify parent when status changes
  useEffect(() => {
    if (Object.keys(companyStatus).length > 0) {
      console.log('Saving companyStatus to localStorage:', companyStatus);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(companyStatus));
      onStatusUpdate?.(companyStatus);
    }
  }, [companyStatus, onStatusUpdate]);

  const handleStatusChange = (
    id: string,
    status: "shortlisted" | "rejected" | "pending"
  ) => {
    setCompanyStatus((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          status,
          timestamp: Date.now(),
        },
      };
      console.log(`Status changed for ${id} to ${status}`);
      return updated;
    });
  };

  const handleNoteChange = (id: string, notes: string) => {
    setCompanyStatus((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          notes,
          timestamp: Date.now(),
        },
      };
      console.log(`Notes updated for ${id}: ${notes}`);
      return updated;
    });
  };

  const handleViewDetails = (company: CompanyCardProps) => {
    // const fullCompany = companies.find(c => c.name === companyName);
    console.log("Full Company",company);
    if (company) {
      navigate(`/company/${company._id}`);
    }
  };

  // Filter and sort companies
  const getFilteredAndSortedCompanies = () => {
    const statusValues = Object.values(companyStatus);

    // Filter by search term and status
    let filtered = statusValues.filter((company) => {
      const matchesSearch = company.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || company.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort companies
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "status") {
        const statusOrder = { shortlisted: 0, pending: 1, rejected: 2 };
        return sortOrder === "asc"
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];
      } else {
        // updated
        return sortOrder === "asc"
          ? a.timestamp - b.timestamp
          : b.timestamp - a.timestamp;
      }
    });

    return sorted;
  };

  const filteredCompanies = getFilteredAndSortedCompanies();

  // Count companies by status
  const shortlistedCount = Object.values(companyStatus).filter(
    (c) => c.status === "shortlisted"
  ).length;
  const rejectedCount = Object.values(companyStatus).filter(
    (c) => c.status === "rejected"
  ).length;
  const pendingCount = Object.values(companyStatus).filter(
    (c) => c.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search companies by name..."
          className="pl-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
      </div>

      {/* Filters and Sort */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200/60">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <Button
              variant={sortBy === "updated" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (sortBy === "updated") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("updated");
                  setSortOrder("desc");
                }
              }}
              className="text-xs"
            >
              Updated {sortBy === "updated" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (sortBy === "name") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("name");
                  setSortOrder("asc");
                }
              }}
              className="text-xs"
            >
              Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
            <Button
              variant={sortBy === "status" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (sortBy === "status") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("status");
                  setSortOrder("asc");
                }
              }}
              className="text-xs"
            >
              Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
            >
              All ({Object.keys(companyStatus).length})
            </Button>
            <Button
              variant={statusFilter === "shortlisted" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("shortlisted")}
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
            >
              <Check className="mr-1 h-3 w-3" />
              Shortlisted ({shortlistedCount})
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("rejected")}
              className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
            >
              <X className="mr-1 h-3 w-3" />
              Rejected ({rejectedCount})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
            >
              Pending ({pendingCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Companies Display */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200/60">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Companies Found</h3>
          <p className="text-gray-500">No companies match your current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyActionCard
              key={company.id}
              company={company}
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      
    </div>
  );
};

export default CompanyManager;
