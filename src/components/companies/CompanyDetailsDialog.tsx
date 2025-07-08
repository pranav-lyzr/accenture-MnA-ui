import { useState, useEffect } from "react";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import DetailDialog from "../../components/ui/DetailDialog";
import { Button } from "../../components/botton";
import {
  Loader2,
  Database,
  Search,
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
  const [fullCompany, setFullCompany] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingApollo, setLoadingApollo] = useState(false);
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [loadingLinkedIn, setLoadingLinkedIn] = useState(false);
  const [err, setErr] = useState<{ apollo?: string; research?: string; linkedin?: string }>({});

  // Fetch full company data on open
  useEffect(() => {
    if (!open || !company?.name) return;
    console.log(company.name)
    setLoading(true);
    setErr({});
    setFullCompany(null);
    api.getCompanyFullDataByName(company.name)
      .then((data) => setFullCompany(data))
      .catch(() => setErr((prev) => ({ ...prev, basic: "Failed to fetch company details." })))
      .finally(() => setLoading(false));
  }, [open, company?.name]);

  // Helper for field formatting
  const formatFieldName = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper for rendering values
  const renderValue = (value: unknown, key: string) => {
    console.log("key",key)
    if (value === null || value === undefined) {
      return "N/A";
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return "N/A";
      if (typeof value[0] === "object" && value[0] !== null) {
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="bg-purple-50 rounded p-3 border border-purple-100">
                {Object.entries(item).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="font-medium text-purple-700">{formatFieldName(k)}:</span>
                    <span className="text-slate-900 font-medium">{(v as React.ReactNode) || "N/A"}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{item}</span>
          ))}
        </div>
      );
    }
    if (typeof value === "object") {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="font-medium text-purple-700">{formatFieldName(key)}:</span>
              <span className="text-slate-900 font-medium text-right max-w-[60%] break-words">{Array.isArray(val) ? val.join(", ") : val?.toString() || "N/A"}</span>
            </div>
          ))}
        </div>
      );
    }
    if (typeof value === "string" && value.startsWith("http")) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline break-all">{value}</a>
      );
    }
    return <span className="text-slate-900 font-medium text-lg">{value.toString()}</span>;
  };

  // Fetchers for missing data
  const fetchApolloData = async () => {
    if (!fullCompany?._id) return;
    setLoadingApollo(true);
    setErr((prev) => ({ ...prev, apollo: undefined }));
    try {
      const result = await api.enrichCompanyApollo(fullCompany._id);
      setFullCompany((prev) => prev ? ({
        ...prev,
        data_sources: {
          ...prev.data_sources,
          apollo: { raw_data: result.company, last_updated: new Date().toISOString() }
        }
      }) : prev);
    } catch (error) {
      setErr((prev) => ({ ...prev, apollo: "Failed to fetch Apollo data." }));
    } finally {
      setLoadingApollo(false);
    }
  };

  const fetchResearchData = async () => {
    console.log(fullCompany)
    if (!fullCompany?._id) return;
    setLoadingResearch(true);
    setErr((prev) => ({ ...prev, research: undefined }));
    try {
      const result = await api.companyResearch(fullCompany._id);
      setFullCompany((prev) => prev ? ({
        ...prev,
        data_sources: {
          ...prev.data_sources,
          lyzr_research: { raw_data: result, last_updated: new Date().toISOString() }
        }
      }) : prev);
    } catch (error) {
      setErr((prev) => ({ ...prev, research: "Failed to fetch research data." }));
    } finally {
      setLoadingResearch(false);
    }
  };

  const fetchLinkedInData = async () => {
    if (!fullCompany?._id) return;
    setLoadingLinkedIn(true);
    setErr((prev) => ({ ...prev, linkedin: undefined }));
    try {
      const result = await api.fetchCompanyLinkedIn(fullCompany._id);
      setFullCompany((prev) => prev ? ({
        ...prev,
        data_sources: {
          ...prev.data_sources,
          linkedin: { raw_data: result, last_updated: new Date().toISOString() }
        }
      }) : prev);
    } catch (error) {
      setErr((prev) => ({ ...prev, linkedin: "Failed to fetch LinkedIn data." }));
    } finally {
      setLoadingLinkedIn(false);
    }
  };

  if (!company) return null;

  // Prepare data for each tab
  console.log("fullCompany",fullCompany)
  const basicInfo = fullCompany ? Object.fromEntries(Object.entries(fullCompany).filter(([k]) => k !== "data_sources")) : null;
  const apolloData = fullCompany?.data_sources?.apollo?.raw_data;
  const researchData = fullCompany?.data_sources?.lyzr_research?.research_data;
  const linkedInData = fullCompany?.data_sources?.linkedin?.raw_data;

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
            {company.domain_name}
          </a>
        )
      }
    >
      <div className="w-full">
        <Tabs className="w-full">
          <TabList className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <Tab className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 react-tabs__tab--selected:bg-white react-tabs__tab--selected:text-purple-900 react-tabs__tab--selected:shadow-sm cursor-pointer transition-all duration-200">Basic Info</Tab>
            <Tab className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 react-tabs__tab--selected:bg-white react-tabs__tab--selected:text-blue-900 react-tabs__tab--selected:shadow-sm cursor-pointer transition-all duration-200">Apollo Data</Tab>
            <Tab className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 react-tabs__tab--selected:bg-white react-tabs__tab--selected:text-emerald-900 react-tabs__tab--selected:shadow-sm cursor-pointer transition-all duration-200">Research Data</Tab>
            <Tab className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 react-tabs__tab--selected:bg-white react-tabs__tab--selected:text-emerald-900 react-tabs__tab--selected:shadow-sm cursor-pointer transition-all duration-200">LinkedIn Data</Tab>
          </TabList>

          {/* Basic Info Tab */}
          <TabPanel>
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : basicInfo ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-2 h-8 bg-purple-600 rounded-full mr-3"></div>
                    <h3 className="text-xl font-bold text-slate-800">Company Overview</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(basicInfo).map(([key, value]) => (
                      <div key={key} className="group">
                        <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md">
                          <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide block mb-3">{formatFieldName(key)}</span>
                          <div>{renderValue(value, key)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No data available.</div>
              )}
            </div>
          </TabPanel>

          {/* Apollo Data Tab */}
          <TabPanel>
            <div className="space-y-6">
              {apolloData ? (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg mr-3">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">Apollo</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(apolloData).map(([key, value]) => (
                      <div key={key} className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 transition-colors">
                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">{formatFieldName(key)}</span>
                        <div className="text-blue-950">{renderValue(value, key)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-8 mb-6 shadow-sm text-center">
                  <div className="bg-blue-600 p-3 rounded-lg mx-auto mb-4 w-fit">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Apollo</h3>
                  <p className="text-blue-700 mb-6">Get enriched company data from Apollo's database</p>
                  <Button
                    variant="outline"
                    onClick={fetchApolloData}
                    disabled={loadingApollo || !fullCompany?._id}
                    className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 mx-auto"
                  >
                    {loadingApollo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    <span>Fetch Apollo Data</span>
                  </Button>
                  {err.apollo && <div className="text-red-600 mt-2">{err.apollo}</div>}
                </div>
              )}
            </div>
          </TabPanel>

          {/* Research Data Tab */}
          <TabPanel>
            <div className="space-y-6">
              {researchData ? (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="bg-emerald-600 p-2 rounded-lg mr-3">
                      <Search className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">Research</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(researchData).map(([key, value]) => (
                      <div key={key} className="bg-white rounded-lg p-4 border border-emerald-200 hover:border-emerald-400 transition-colors">
                        <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide block mb-2">{formatFieldName(key)}</span>
                        <div className="text-emerald-950">{renderValue(value, key)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-8 mb-6 shadow-sm text-center">
                  <div className="bg-emerald-600 p-3 rounded-lg mx-auto mb-4 w-fit">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-4">Research</h3>
                  <p className="text-emerald-700 mb-6">Get comprehensive market research and intelligence data</p>
                  <Button
                    variant="outline"
                    onClick={fetchResearchData}
                    disabled={loadingResearch || !fullCompany?._id}
                    className="flex items-center space-x-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 mx-auto"
                  >
                    {loadingResearch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span>Fetch Research Data</span>
                  </Button>
                  {err.research && <div className="text-red-600 mt-2">{err.research}</div>}
                </div>
              )}
            </div>
          </TabPanel>

          {/* LinkedIn Data Tab */}
          <TabPanel>
            <div className="space-y-6">
              {linkedInData ? (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg mr-3">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">LinkedIn</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(linkedInData).map(([key, value]) => (
                      <div key={key} className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 transition-colors">
                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide block mb-2">{formatFieldName(key)}</span>
                        <div className="text-blue-950">{renderValue(value, key)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-8 mb-6 shadow-sm text-center">
                  <div className="bg-blue-600 p-3 rounded-lg mx-auto mb-4 w-fit">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-4">LinkedIn</h3>
                  <p className="text-blue-700 mb-6">Fetch company data from LinkedIn</p>
                  <Button
                    variant="outline"
                    onClick={fetchLinkedInData}
                    disabled={loadingLinkedIn || !fullCompany?._id}
                    className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 mx-auto"
                  >
                    {loadingLinkedIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    <span>Fetch LinkedIn Data</span>
                  </Button>
                  {err.linkedin && <div className="text-red-600 mt-2">{err.linkedin}</div>}
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
