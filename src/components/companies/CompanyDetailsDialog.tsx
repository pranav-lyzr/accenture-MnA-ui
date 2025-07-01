import { useState, useEffect } from "react";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import DetailDialog from "../../components/ui/DetailDialog";
import { Button } from "../../components/botton";
import {
  Loader2,
  Database,
  Search,
  Building2,
  Users,
  DollarSign,
  MapPin,
  Globe,
  Briefcase,
  Target,
  ExternalLink,
} from "lucide-react";
import api from "../../services/api";

interface CompanyDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Record<string, any> | null;
}

const CompanyDetailsDialog = ({
  open,
  onOpenChange,
  company,
}: CompanyDetailsProps) => {
  const [loadingApollo, setLoadingApollo] = useState(false);
  const [loadingPerplexity, setLoadingPerplexity] = useState(false);
  const [loadingLinkedIn, setLoadingLinkedIn] = useState(false);
  const [apolloData, setApolloData] = useState<Record<string, any> | null>(
    null
  );
  const [researchData, setResearchData] = useState<Record<string, any> | null>(
    null
  );
  const [linkedInData, setLinkedInData] = useState<any>(null);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);

  const [err, setErr] = useState<{
    apollo: string | null;
    perplexity: string | null;
    research: string | null;
  }>({
    apollo: null,
    perplexity: null,
    research: null,
  });

  const fetchCompanyResearchData = async () => {
    try {
      console.log("Fetching research data for:", company?.name);
      const companyResearchData = await api.researchDataByCompanyName(
        company?.name
      );
      console.log(companyResearchData, "companyResearchData");
      setResearchData(companyResearchData);
    } catch (err) {
      console.log(err, "Error");
    }
    try {
      console.log("Fetching research data for:", company?.domain_name);
      const companyResearchData = await api.fetchAvailableCompanyLinkedIn(
        company?.domain_name
      );
      console.log(companyResearchData, "companyResearchData");
      setLinkedInData(companyResearchData);
    } catch (err) {
      console.log(err, "Error");
    }
  };

  useEffect(() => {
    if (!company?.name) return;
    fetchCompanyResearchData();
    return () => {
      setResearchData(null);
      setLinkedInData(null);
      setApolloData(null);
      setErr({
        apollo: null,
        perplexity: null,
        research: null,
      });
    };
  }, [company?.name]);

  useEffect(() => {
    if (!open) {
      setLinkedInData(null);
      setLinkedInError(null);
    }
  }, [open]);

  // Auto-scroll to research data when it loads
  useEffect(() => {
    if (researchData) {
      const researchSection = document.getElementById("research-data-section");
      if (researchSection) {
        researchSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [researchData]);

  if (!company) return null;

  const fetchApolloData = async () => {
    if (!company.domain_name) return;

    try {
      setLoadingApollo(true);
      const result = await api.enrichCompanyApollo(company.domain_name);

      console.log(result.company, "result appolo");
      setApolloData(result.company);
    } catch (error) {
      console.error("Error fetching Apollo data:", error);
      setErr((prevErr) => ({
        ...prevErr,
        apollo: "Some error occurred",
      }));
    } finally {
      setLoadingApollo(false);
    }
  };

  const fetchPerplexityData = async () => {
    if (!company.name || !company.domain_name) return;

    try {
      setLoadingPerplexity(true);
      const result = await api.companyResearch(
        company.name,
        company.domain_name
      );
      setResearchData(result);
    } catch (error) {
      console.error("Error fetching Perplexity data:", error);
    } finally {
      setLoadingPerplexity(false);
    }
  };

  const fetchLinkedInData = async () => {
    if (!company.domain_name) return;
    try {
      setLoadingLinkedIn(true);
      setLinkedInError(null);
      const result = await api.fetchCompanyLinkedIn(company.domain_name);
      setLinkedInData(result);
    } catch (error) {
      setLinkedInError("Failed to fetch LinkedIn data.");
    } finally {
      setLoadingLinkedIn(false);
    }
  };

  const formatFieldName = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderBasicInfo = () => {
    // Helper function to render complex values
    const renderValue = (value: unknown, key: string) => {
      if (value === null || value === undefined) {
        return "N/A";
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return "N/A";

        // Handle array of objects (like leadership)
        if (typeof value[0] === "object" && value[0] !== null) {
          return (
            <div className="space-y-2">
              {value.map((item, index) => (
                <div
                  key={index}
                  className="bg-purple-50 rounded p-3 border border-purple-100"
                >
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="font-medium text-purple-700">
                        {formatFieldName(k)}:
                      </span>
                      <span className="text-slate-900 font-medium">
                        {(v as React.ReactNode) || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        }

        // Handle array of strings/primitives with special formatting for Services field
        if (key === "Services" && typeof value[0] === "string") {
          // Split services string by commas and create individual badges
          const services = value[0].split(",").map((service) => service.trim());
          return (
            <div className="flex flex-wrap gap-2">
              {services.map((service, serviceIndex) => (
                <span
                  key={serviceIndex}
                  className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          );
        }

        // Handle sources with clickable links (no background)
        if (key === "sources") {
          return (
            <div className="space-y-1">
              {value.map((url, index) => (
                <div key={index}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline break-all text-sm"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          );
        }

        // Handle regular array of strings/primitives (like key_clients, office_locations)
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        );
      }

      if (typeof value === "object") {
        // Handle nested objects
        return (
          <div className="space-y-2">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-medium text-purple-700">
                  {formatFieldName(key)}:
                </span>
                <span className="text-slate-900 font-medium text-right max-w-[60%] break-words">
                  {Array.isArray(val)
                    ? val.join(", ")
                    : val?.toString() || "N/A"}
                </span>
              </div>
            ))}
          </div>
        );
      }

      // Handle URLs in sources
      if (typeof value === "string" && value.startsWith("http")) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline break-all"
          >
            {value}
          </a>
        );
      }

      // Handle regular strings
      return (
        <span className="text-slate-900 font-medium text-lg">
          {value.toString()}
        </span>
      );
    };

    // Skip certain fields that are not useful for display or already shown elsewhere
    const skipFields = ["name", "domain_name", "validation_warnings"];

    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-2 h-8 bg-purple-600 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-slate-800">Company Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(company)
            .filter(([key]) => !skipFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="group">
                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md">
                  <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide block mb-3">
                    {formatFieldName(key)}
                  </span>
                  <div>{renderValue(value, key)}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderApolloData = () => {
    // Helper function to render complex values
    const renderValue = (value: unknown) => {
      if (value === null || value === undefined) {
        return "N/A";
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return "N/A";

        // Handle array of objects (like current_technologies)
        if (typeof value[0] === "object" && value[0] !== null) {
          return (
            <div className="space-y-2">
              {value.slice(0, 5).map((item, index) => (
                <div key={index} className="bg-blue-50 rounded p-2 text-xs">
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="font-medium">{formatFieldName(k)}:</span>
                      <span>{ (v as React.ReactNode) || "N/A"}</span>
                    </div>
                  ))}
                </div>
              ))}
              {value.length > 5 && (
                <div className="text-xs text-blue-600 italic">
                  +{value.length - 5} more items
                </div>
              )}
            </div>
          );
        }

        // Handle array of strings/primitives
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 10).map((item, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {item}
              </span>
            ))}
            {value.length > 10 && (
              <span className="text-xs text-blue-600 italic">
                +{value.length - 10} more
              </span>
            )}
          </div>
        );
      }

      if (typeof value === "object") {
        // Handle nested objects (like primary_phone, industry_tag_hash, etc.)
        return (
          <div className="space-y-1">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="font-medium text-blue-600">
                  {formatFieldName(key)}:
                </span>
                <span className="text-right max-w-[60%] break-words">
                  {Array.isArray(val)
                    ? val.join(", ")
                    : val?.toString() || "N/A"}
                </span>
              </div>
            ))}
          </div>
        );
      }

      // Handle primitives
      if (typeof value === "string" && value.startsWith("http")) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {value}
          </a>
        );
      }

      return value.toString();
    };

    // Skip certain fields that are not useful for display
    const skipFields = [
      "id",
      "snippets_loaded",
      "org_chart_root_people_ids",
      "org_chart_removed",
      "org_chart_show_department_filter",
      "generic_org_insights",
    ];

    if (err.apollo)
      return (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-8 mb-6 shadow-sm text-center">
            <div className="bg-blue-600 p-3 rounded-lg mx-auto mb-4 w-fit">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">Apollo</h3>
            <p className="text-red-700 mb-6">
              Not able to find the details regarding {company.name} in Apollos
              database{" "}
            </p>
          </div>
        </>
      );

    if (!apolloData) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-8 mb-6 shadow-sm text-center">
          <div className="bg-blue-600 p-3 rounded-lg mx-auto mb-4 w-fit">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-4">Apollo</h3>
          <p className="text-blue-700 mb-6">
            Get enriched company data from Apollo's database
          </p>
          <Button
            variant="outline"
            onClick={fetchApolloData}
            disabled={loadingApollo || !company.domain_name}
            className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 mx-auto"
          >
            {loadingApollo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            <span>Fetch Apollo Data</span>
          </Button>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Database className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-blue-900">Apollo</h3>
          </div>
          <Button
            variant="outline"
            onClick={fetchApolloData}
            disabled={loadingApollo || !company.domain_name}
            size="sm"
            className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
          >
            {loadingApollo ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Database className="h-3 w-3" />
            )}
            <span>Refresh</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(apolloData)
            .filter(([key]) => !skipFields.includes(key))
            .map(([key, value]) => (
              <div
                key={key}
                className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 transition-colors"
              >
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                  {formatFieldName(key)}
                </span>
                <div className="text-blue-950">{renderValue(value)}</div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderResearchData = () => {
    if (!researchData) {
      return (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-8 shadow-sm text-center">
          <div className="bg-emerald-600 p-3 rounded-lg mx-auto mb-4 w-fit">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-900 mb-4">
            Research Agent
          </h3>
          <p className="text-emerald-700 mb-6">
            Get comprehensive market research and intelligence data
          </p>
          <Button
            variant="outline"
            onClick={fetchPerplexityData}
            disabled={
              loadingPerplexity || !company.domain_name || !company.name
            }
            className="flex items-center space-x-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 mx-auto"
          >
            {loadingPerplexity ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>Research</span>
          </Button>
        </div>
      );
    }

    const {
      // company_name,
      company_hq_location,
      year_founded,
      ownership_status,
      // ownership_details,
      financial_information,
      employee_metrics,
      company_overview,
      service_offerings,
      // products,
      key_clients,
      // management_team,
      website,
      // partnerships_alliances,
      industries_served,
      office_locations,
      // revenue_geographic_mix,
      sources,
      data_availability_notes,
    } = researchData;

    return (
      <div
        id="research-data-section"
        className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-emerald-600 p-3 rounded-lg mr-3">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-900">
              Research Agent
            </h3>
          </div>
          <Button
            variant="outline"
            onClick={fetchPerplexityData}
            disabled={
              loadingPerplexity || !company.domain_name || !company.name
            }
            size="sm"
            className="flex items-center space-x-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
          >
            {loadingPerplexity ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Search className="h-3 w-3" />
            )}
            <span>Refresh</span>
          </Button>
        </div>

        {/* Company Overview Card */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-emerald-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-emerald-600 mr-2" />
            <h4 className="text-lg font-bold text-emerald-900">
              Company Foundation
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                Headquarters
              </span>
              <p className="text-emerald-900 font-medium">
                {company_hq_location || "N/A"}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                Founded
              </span>
              <p className="text-emerald-900 font-medium">
                {year_founded || "N/A"}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                Ownership
              </span>
              <p className="text-emerald-900 font-medium">
                {ownership_status || "N/A"}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                Website
              </span>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center hover:underline"
                >
                  <span className="truncate">
                    {website.replace(/^https?:\/\//, "")}
                  </span>
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                </a>
              )}
            </div>
          </div>
          {company_overview?.description && (
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide block mb-2">
                Company Description
              </span>
              <p className="text-emerald-900 leading-relaxed">
                {company_overview.description}
              </p>
            </div>
          )}
        </div>

        {/* Employee & Financial Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {employee_metrics && (
            <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-emerald-600 mr-2" />
                <h4 className="text-lg font-bold text-emerald-900">
                  Workforce
                </h4>
              </div>
              <div className="space-y-3">
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                    Total Headcount
                  </span>
                  <p className="text-emerald-900 font-bold text-xl">
                    {employee_metrics.total_headcount || "N/A"}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                    Revenue per Employee
                  </span>
                  <p className="text-emerald-900 font-bold text-xl">
                    {employee_metrics.revenue_per_employee || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {financial_information && (
            <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 text-emerald-600 mr-2" />
                <h4 className="text-lg font-bold text-emerald-900">
                  Financial Overview
                </h4>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                  Revenue Data
                </span>
                <p className="text-emerald-900 font-medium">
                  {financial_information.revenue_history?.[0]?.revenue ||
                    "Not Available"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Services & Industries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {service_offerings && service_offerings.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Briefcase className="h-5 w-5 text-emerald-600 mr-2" />
                <h4 className="text-lg font-bold text-emerald-900">
                  Service Portfolio
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {service_offerings.map((service: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-2 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full border border-emerald-200 hover:bg-emerald-200 transition-colors"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {industries_served && industries_served.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Target className="h-5 w-5 text-emerald-600 mr-2" />
                <h4 className="text-lg font-bold text-emerald-900">
                  Target Industries
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {industries_served.map((industry: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-2 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200 hover:bg-purple-200 transition-colors"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Key Clients */}
        {key_clients && key_clients.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-emerald-200 shadow-sm">
            <h4 className="text-lg font-bold text-emerald-900 mb-4">
              Strategic Clients
            </h4>
            <div className="flex flex-wrap gap-3">
              {key_clients.map((client: string, i: number) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-slate-100 text-slate-800 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  {client}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Office Locations */}
        {office_locations && office_locations.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-emerald-200 shadow-sm">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
              <h4 className="text-lg font-bold text-emerald-900">
                Global Presence
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {office_locations.map((location: any, i: number) => (
                <div
                  key={i}
                  className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <span className="text-emerald-900 font-medium">
                    {location.city}, {location.country}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-emerald-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-emerald-600 mr-2" />
              <h4 className="text-lg font-bold text-emerald-900">
                Data Sources
              </h4>
            </div>
            <div className="space-y-3">
              {sources.map((source: any, i: number) => (
                <div
                  key={i}
                  className="bg-emerald-50 rounded-lg p-3 border border-emerald-200"
                >
                  <span className="text-sm font-semibold text-emerald-700 block mb-1">
                    {source.information_type}
                  </span>
                  <a
                    href={source.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center hover:underline"
                  >
                    {source.source_name}{" "}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Availability Notes */}
        {data_availability_notes?.unavailable_data_points && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="font-bold text-amber-900 mb-3">Data Limitations</h4>
            <p className="text-sm text-amber-800 mb-3 font-medium">
              The following data points were not publicly available:
            </p>
            <div className="flex flex-wrap gap-2">
              {data_availability_notes.unavailable_data_points.map(
                (item: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={company.name}
      subtitle={
        company.domain_name && (
          <a
            href={`https://${company.domain_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 hover:underline flex items-center font-medium"
          >
            {company.domain_name} <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        )
      }
    >
      <div className="w-full">
        <Tabs className="w-full">
          <TabList className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <Tab className="flex-1 px-4 py-2 text-sm font-medium text-gray-700  hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 react-tabs__tab--selected:bg-white react-tabs__tab--selected:text-purple-900 react-tabs__tab--selected:shadow-sm cursor-pointer transition-all duration-200">
              Basic Info
            </Tab>
            <Tab className="flex-1 px-4 py-2 text-sm font-medium text-gray-700  hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 react-tabs__tab--selected:bg-white react-tabs__tab--selected:text-blue-900 react-tabs__tab--selected:shadow-sm cursor-pointer transition-all duration-200">
              Apollo Data
            </Tab>
            <Tab className="flex-1 px-4 py-2 text-sm font-medium text-gray-700  hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 react-tabs__tab--selected:bg-white react-tabs__tab--selected:text-emerald-900 react-tabs__tab--selected:shadow-sm cursor-pointer transition-all duration-200">
              Research Data
            </Tab>
            <Tab className="flex-1 px-4 py-2 text-sm font-medium text-gray-700  hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 react-tabs__tab--selected:bg-white react-tabs__tab--selected:text-emerald-900 react-tabs__tab--selected:shadow-sm cursor-pointer transition-all duration-200">
              LinkedIn Data
            </Tab>
          </TabList>

          <TabPanel>
            <div className="space-y-6">{renderBasicInfo()}</div>
          </TabPanel>

          <TabPanel>
            <div className="space-y-6">{renderApolloData()}</div>
          </TabPanel>

          <TabPanel>
            <div className="space-y-6">{renderResearchData()}</div>
          </TabPanel>

          <TabPanel>
            <div className="space-y-6">
              {!linkedInData ? (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-8 mb-6 shadow-sm text-center">
                  <div className="bg-blue-600 p-3 rounded-lg mx-auto mb-4 w-fit">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-4">LinkedIn</h3>
                  <p className="text-blue-700 mb-6">
                    Fetch company data from LinkedIn
                  </p>
                  <Button
                    variant="outline"
                    onClick={fetchLinkedInData}
                    disabled={loadingLinkedIn || !company.domain_name}
                    className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 mx-auto"
                  >
                    {loadingLinkedIn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    <span>Fetch LinkedIn Data</span>
                  </Button>
                </div>
              ) : linkedInError ? (
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-8 mb-6 shadow-sm text-center">
                  <div className="bg-red-600 p-3 rounded-lg mx-auto mb-4 w-fit">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900 mb-4">LinkedIn</h3>
                  <p className="text-red-700 mb-6">{linkedInError}</p>
                  <Button
                    variant="outline"
                    onClick={fetchLinkedInData}
                    disabled={loadingLinkedIn || !company.domain_name}
                    className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 mx-auto"
                  >
                    {loadingLinkedIn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    <span>Retry Fetch</span>
                  </Button>
                </div>
              ) : linkedInData && !linkedInData.company_name ? (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-8 mb-6 shadow-sm text-center">
                  <div className="bg-yellow-600 p-3 rounded-lg mx-auto mb-4 w-fit">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-4">LinkedIn</h3>
                  <p className="text-yellow-700 mb-6">
                    {linkedInData.message || "No LinkedIn data found for this company"}
                  </p>
                  <Button
                    variant="outline"
                    onClick={fetchLinkedInData}
                    disabled={loadingLinkedIn || !company.domain_name}
                    className="flex items-center space-x-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 mx-auto"
                  >
                    {loadingLinkedIn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    <span>Fetch LinkedIn Data</span>
                  </Button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-blue-600 p-3 rounded-lg mr-3">
                        <Database className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-blue-900">LinkedIn</h3>
                    </div>
                    <Button
                      variant="outline"
                      onClick={fetchLinkedInData}
                      disabled={loadingLinkedIn || !company.domain_name}
                      size="sm"
                      className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                    >
                      {loadingLinkedIn ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Database className="h-3 w-3" />
                      )}
                      <span>Refresh</span>
                    </Button>
                  </div>

                  {/* Company Header */}
                  <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200 shadow-sm">
                    <div className="flex items-center mb-4">
                      {linkedInData.logo_url && (
                        <img 
                          src={linkedInData.logo_url} 
                          alt="Company Logo" 
                          className="h-16 w-16 rounded-lg object-contain mr-4 border border-blue-200" 
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-blue-900 mb-2">
                          {linkedInData.company_name}
                        </h4>
                        <p className="text-blue-700 font-medium mb-2">
                          {linkedInData.tagline}
                        </p>
                        <a
                          href={linkedInData.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center hover:underline"
                        >
                          View LinkedIn Profile
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                    
                    {linkedInData.description && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                          Company Description
                        </span>
                        <p className="text-blue-900 leading-relaxed whitespace-pre-line">
                          {linkedInData.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                        Industry
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {linkedInData.industries?.map((industry: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                        Employee Count
                      </span>
                      <p className="text-blue-900 font-bold text-xl">
                        {linkedInData.employee_count?.toLocaleString()} ({linkedInData.employee_range})
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                        Founded
                      </span>
                      <p className="text-blue-900 font-bold text-xl">
                        {linkedInData.year_founded || "N/A"}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                        Headquarters
                      </span>
                      <p className="text-blue-900 font-medium">
                        {linkedInData.hq_full_address}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                        Website
                      </span>
                      {linkedInData.website && (
                        <a
                          href={linkedInData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center hover:underline"
                        >
                          <span className="truncate">
                            {linkedInData.website.replace(/^https?:\/\//, "")}
                          </span>
                          <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                        </a>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                        Followers
                      </span>
                      <p className="text-blue-900 font-bold text-xl">
                        {linkedInData.follower_count?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Specialties */}
                  {linkedInData.specialties && (
                    <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200 shadow-sm">
                      <h4 className="text-lg font-bold text-blue-900 mb-4">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {linkedInData.specialties.split(', ').map((specialty: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200"
                          >
                            {specialty.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Office Locations */}
                  {linkedInData.locations && linkedInData.locations.length > 0 && (
                    <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200 shadow-sm">
                      <div className="flex items-center mb-4">
                        <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="text-lg font-bold text-blue-900">Office Locations</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {linkedInData.locations.map((location: any, index: number) => (
                          <div
                            key={index}
                            className={`rounded-lg p-4 border ${
                              location.is_headquarter 
                                ? 'bg-blue-100 border-blue-300' 
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <span className="font-bold text-blue-900">
                                {location.city}, {location.country}
                              </span>
                              {location.is_headquarter && (
                                <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                  HQ
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-blue-700">
                              {location.full_address}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affiliated Companies */}
                  {linkedInData.affiliated_companies && linkedInData.affiliated_companies.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                      <h4 className="text-lg font-bold text-blue-900 mb-4">Affiliated Companies</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {linkedInData.affiliated_companies.map((affiliate: any, index: number) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <a
                              href={affiliate.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center hover:underline"
                            >
                              {affiliate.name}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </DetailDialog>
  );
};

export default CompanyDetailsDialog;
