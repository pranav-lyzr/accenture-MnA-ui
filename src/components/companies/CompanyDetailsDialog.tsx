import { useState } from "react";
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
  Calendar,
  Globe,
  Briefcase,
  Target,
  ExternalLink
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
  const [apolloData, setApolloData] = useState<Record<string, any> | null>(null);
  const [researchData, setResearchData] = useState<Record<string, any> | null>(null);

  if (!company) return null;

  const fetchApolloData = async () => {
    if (!company.domain_name) return;

    try {
      setLoadingApollo(true);
      const result = await api.enrichCompanyApollo(company.domain_name);
      setApolloData(result.company);
    } catch (error) {
      console.error("Error fetching Apollo data:", error);
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

  const formatFieldName = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderBasicInfo = () => (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(company).map(([key, value]) => {
          if (key === "name" || key === "domain_name") return null;
          return (
            <div key={key} className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">
                {formatFieldName(key)}
              </span>
              <span className="text-gray-900">
                {Array.isArray(value) ? value.join(", ") : value?.toString() || "N/A"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderApolloData = () => {
    if (!apolloData) return null;

    return (
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <div className="flex items-center mb-3">
          <Database className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-800">Apollo Data</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(apolloData).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-sm font-medium text-blue-700">
                {formatFieldName(key)}
              </span>
              <span className="text-blue-900">
                {Array.isArray(value) ? value.join(", ") : value?.toString() || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderResearchData = () => {
    if (!researchData) return null;

    const {
      company_name,
      company_hq_location,
      year_founded,
      ownership_status,
      ownership_details,
      financial_information,
      employee_metrics,
      company_overview,
      service_offerings,
      products,
      key_clients,
      management_team,
      website,
      partnerships_alliances,
      industries_served,
      office_locations,
      revenue_geographic_mix,
      sources,
      data_availability_notes
    } = researchData;

    return (
      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
        <div className="flex items-center mb-4">
          <Search className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-green-800">Research Data</h3>
        </div>

        {/* Company Overview */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Building2 className="h-4 w-4 text-green-600 mr-2" />
            <h4 className="font-semibold text-green-800">Company Overview</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm font-medium text-green-700">Headquarters</span>
              <p className="text-green-900">{company_hq_location || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-green-700">Founded</span>
              <p className="text-green-900">{year_founded || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-green-700">Ownership</span>
              <p className="text-green-900">{ownership_status || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-green-700">Website</span>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline flex items-center"
                >
                  {website} <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
          </div>
          {company_overview?.description && (
            <div>
              <span className="text-sm font-medium text-green-700">Description</span>
              <p className="text-green-900 mt-1">{company_overview.description}</p>
            </div>
          )}
        </div>

        {/* Employee Metrics */}
        {employee_metrics && (
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Users className="h-4 w-4 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Employee Metrics</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-green-700">Total Headcount</span>
                <p className="text-green-900">{employee_metrics.total_headcount || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-green-700">Revenue per Employee</span>
                <p className="text-green-900">{employee_metrics.revenue_per_employee || "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Information */}
        {financial_information && (
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <DollarSign className="h-4 w-4 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Financial Information</h4>
            </div>
            <div className="text-sm text-green-700">
              <p>Revenue, EBITDA, and EBIT data: {financial_information.revenue_history?.[0]?.revenue || "Not Available"}</p>
            </div>
          </div>
        )}

        {/* Services & Industries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {service_offerings && service_offerings.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <Briefcase className="h-4 w-4 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-800">Service Offerings</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {service_offerings.map((service: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {industries_served && industries_served.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <Target className="h-4 w-4 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-800">Industries Served</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {industries_served.map((industry: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
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
          <div className="mb-6">
            <h4 className="font-semibold text-green-800 mb-2">Key Clients</h4>
            <div className="flex flex-wrap gap-2">
              {key_clients.map((client: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-200 text-green-800 text-sm rounded-lg"
                >
                  {client}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Office Locations */}
        {office_locations && office_locations.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <MapPin className="h-4 w-4 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Office Locations</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {office_locations.map((location: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                >
                  {location.city}, {location.country}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Globe className="h-4 w-4 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Sources</h4>
            </div>
            <div className="space-y-2">
              {sources.map((source: any, i: number) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-green-700">
                    {source.information_type}:
                  </span>
                  <a
                    href={source.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline ml-2 flex items-center inline-flex"
                  >
                    {source.source_name} <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Availability Notes */}
        {data_availability_notes?.unavailable_data_points && (
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Data Limitations</h4>
            <p className="text-sm text-yellow-700 mb-2">
              The following data points were not publicly available:
            </p>
            <div className="flex flex-wrap gap-1">
              {data_availability_notes.unavailable_data_points.map((item: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                >
                  {item}
                </span>
              ))}
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
            className="text-blue-600 hover:underline flex items-center"
          >
            {company.domain_name} <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        )
      }
    >
      <div className="flex gap-3 mb-6">
        <Button
          variant="outline"
          onClick={fetchApolloData}
          disabled={loadingApollo || !company.domain_name}
          className="flex items-center space-x-2"
        >
          {loadingApollo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          <span>Fetch Apollo Data</span>
        </Button>

        <Button
          variant="outline"
          onClick={fetchPerplexityData}
          disabled={loadingPerplexity || !company.domain_name || !company.name}
          className="flex items-center space-x-2"
        >
          {loadingPerplexity ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span>Research</span>
        </Button>
      </div>

      <div className="space-y-6">
        {renderBasicInfo()}
        {renderApolloData()}
        {renderResearchData()}
      </div>
    </DetailDialog>
  );
};

export default CompanyDetailsDialog;