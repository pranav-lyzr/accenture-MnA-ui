import React, { useState, useEffect } from "react";
import { Check, X, List, FileText } from "lucide-react";
import { Button } from "../../components/botton";
import { Input } from "../../components/ui/input";
import { ShortlistedCompany, CompanyStatus } from "../../types/company";
import CompanyActionCard from "./CompanyActionCard";
import CompanyDetailsDialog from "./CompanyDetailsDialog";

const LOCAL_STORAGE_KEY = "shortlisted-companies";

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
  const [selectedCompany, setSelectedCompany] = useState<CompanyCardProps | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = useState<"name" | "status" | "updated">("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    setSelectedCompany(company);
    setIsDialogOpen(true);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          type="text"
          placeholder="Search companies..."
          className="flex-1"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            onClick={() => setViewMode("cards")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center flex-wrap gap-2">
          <Button
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

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm">Filter:</span>
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            All ({Object.keys(companyStatus).length})
          </Button>
          <Button
            variant={statusFilter === "shortlisted" ? "default" : "outline"}
            onClick={() => setStatusFilter("shortlisted")}
            className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
          >
            <Check className="mr-1 h-3 w-3" />
            Shortlisted ({shortlistedCount})
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            onClick={() => setStatusFilter("rejected")}
            className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900"
          >
            <X className="mr-1 h-3 w-3" />
            Rejected ({rejectedCount})
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            Pending ({pendingCount})
          </Button>
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500">No companies match your filter criteria.</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border text-left">Company</th>
                <th className="p-2 border text-left">Status</th>
                <th className="p-2 border text-left">Revenue</th>
                <th className="p-2 border text-left">Notes</th>
                <th className="p-2 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{company.name}</td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        company.status === "shortlisted"
                          ? "bg-green-100 text-green-800"
                          : company.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {company.status.charAt(0).toUpperCase() +
                        company.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {company.details.revenue ||
                      company.details.estimated_revenue ||
                      "N/A"}
                  </td>
                  <td className="p-2 border">
                    {company.notes
                      ? company.notes.length > 30
                        ? company.notes.substring(0, 30) + "..."
                        : company.notes
                      : ""}
                  </td>
                  <td className="p-2 border whitespace-nowrap">
                    <div className="flex gap-1">
                      <Button
                        variant="default2"
                        onClick={() =>
                          handleStatusChange(company.id, "shortlisted")
                        }
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="default2"
                        onClick={() => handleStatusChange(company.id, "rejected")}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                      <Button
                        variant="default2"
                        onClick={() => handleViewDetails(company.details)}
                      >
                        <FileText className="h-4 w-4 text-black" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Company details dialog */}
      <CompanyDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        company={selectedCompany}
      />
    </div>
  );
};

export default CompanyManager;