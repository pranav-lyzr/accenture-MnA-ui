import { useState, useEffect } from "react";
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





  // Auto-scroll to research data when it loads
  useEffect(() => {
    if (researchData) {
      const researchSection = document.getElementById('research-data-section');
      if (researchSection) {
        researchSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="w-2 h-8 bg-purple-600 rounded-full mr-3"></div>
        <h3 className="text-xl font-bold text-slate-800">Company Overview</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(company).map(([key, value]) => {
          if (key === "name" || key === "domain_name") return null;
          return (
            <div key={key} className="group">
              <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md">
                <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide block mb-2">
                  {formatFieldName(key)}
                </span>
                <span className="text-slate-900 font-medium text-lg">
                  {Array.isArray(value) ? value.join(", ") : value?.toString() || "N/A"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderApolloData = () => {
    if (!apolloData) return null;

    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-blue-600 p-2 rounded-lg mr-3">
            <Database className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">Apollo Intelligence</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(apolloData).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 transition-colors">
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                {formatFieldName(key)}
              </span>
              <span className="text-blue-950 font-medium">
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
      <div id="research-data-section" className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="bg-emerald-600 p-3 rounded-lg mr-3">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-900">Market Intelligence</h3>
        </div>

        {/* Company Overview Card */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-emerald-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-emerald-600 mr-2" />
            <h4 className="text-lg font-bold text-emerald-900">Company Foundation</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">Headquarters</span>
              <p className="text-emerald-900 font-medium">{company_hq_location || "N/A"}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">Founded</span>
              <p className="text-emerald-900 font-medium">{year_founded || "N/A"}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">Ownership</span>
              <p className="text-emerald-900 font-medium">{ownership_status || "N/A"}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">Website</span>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center hover:underline"
                >
                  <span className="truncate">{website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                </a>
              )}
            </div>
          </div>
          {company_overview?.description && (
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide block mb-2">Company Description</span>
              <p className="text-emerald-900 leading-relaxed">{company_overview.description}</p>
            </div>
          )}
        </div>

        {/* Employee & Financial Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {employee_metrics && (
            <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-emerald-600 mr-2" />
                <h4 className="text-lg font-bold text-emerald-900">Workforce</h4>
              </div>
              <div className="space-y-3">
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">Total Headcount</span>
                  <p className="text-emerald-900 font-bold text-xl">{employee_metrics.total_headcount || "N/A"}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">Revenue per Employee</span>
                  <p className="text-emerald-900 font-bold text-xl">{employee_metrics.revenue_per_employee || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {financial_information && (
            <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 text-emerald-600 mr-2" />
                <h4 className="text-lg font-bold text-emerald-900">Financial Overview</h4>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">Revenue Data</span>
                <p className="text-emerald-900 font-medium">{financial_information.revenue_history?.[0]?.revenue || "Not Available"}</p>
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
                <h4 className="text-lg font-bold text-emerald-900">Service Portfolio</h4>
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
                <h4 className="text-lg font-bold text-emerald-900">Target Industries</h4>
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
            <h4 className="text-lg font-bold text-emerald-900 mb-4">Strategic Clients</h4>
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
              <h4 className="text-lg font-bold text-emerald-900">Global Presence</h4>
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
              <h4 className="text-lg font-bold text-emerald-900">Data Sources</h4>
            </div>
            <div className="space-y-3">
              {sources.map((source: any, i: number) => (
                <div key={i} className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <span className="text-sm font-semibold text-emerald-700 block mb-1">
                    {source.information_type}
                  </span>
                  <a
                    href={source.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center hover:underline"
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="font-bold text-amber-900 mb-3">Data Limitations</h4>
            <p className="text-sm text-amber-800 mb-3 font-medium">
              The following data points were not publicly available:
            </p>
            <div className="flex flex-wrap gap-2">
              {data_availability_notes.unavailable_data_points.map((item: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200"
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
            className="text-purple-600 hover:text-purple-800 hover:underline flex items-center font-medium"
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
          className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
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
          className="flex items-center space-x-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
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