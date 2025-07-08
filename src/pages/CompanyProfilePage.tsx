import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Button } from "../components/botton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Loader2, Database, Search, ExternalLink, ArrowLeft, Building2, MapPin, Users, DollarSign, Target, Zap, Globe, Award, TrendingUp } from "lucide-react";
import Layout from "../components/layout/Layout";

const CompanyProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<{ apollo: boolean; linkedin: boolean; research: boolean; analysis: boolean }>({
    apollo: false,
    linkedin: false,
    research: false,
    analysis: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  const fetchCompany = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCompanyFullData(id);
      setCompany(data);
    } catch (err) {
      setError("Failed to load company data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisHistory = async () => {
    if (!id) return;
    try {
      const response = await api.getCompanyAnalysis(id);
      if (response.data && response.data.length > 0) {
        setAnalysisHistory(response.data);
        setAnalysisData(response.data[0].analysis); // Set the most recent analysis
      }
    } catch (err) {
      console.error("Error fetching analysis history:", err);
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchAnalysisHistory();
  }, [id]);

  const handleRefresh = async (type: "apollo" | "linkedin" | "research" | "analysis") => {
    if (!id) return;
    setRefreshing((prev) => ({ ...prev, [type]: true }));
    try {
      if (type === "apollo") {
        await api.enrichCompanyApollo(id);
      } else if (type === "linkedin") {
        await api.fetchCompanyLinkedIn(id);
      } else if (type === "research") {
        await api.companyResearch(id);
      } else if (type === "analysis") {
        const newAnalysis = await api.analyzeCompanyWithLyzr(id);
        setAnalysisData(newAnalysis);
        await fetchAnalysisHistory(); // Refresh history after new analysis
      }
      
      if (type !== "analysis") {
        await fetchCompany();
      }
    } catch (err) {
      setError(`Failed to refresh ${type} data.`);
    } finally {
      setRefreshing((prev) => ({ ...prev, [type]: false }));
    }
  };

  const formatFieldName = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined) return <span className="text-gray-400">N/A</span>;
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400">N/A</span>;
      
      if (typeof value[0] === "object" && value[0] !== null) {
        return (
          <div className="space-y-3">
            {value.map((item, idx) => (
              <Card key={idx} className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-2 pt-4">
                    {Object.entries(item).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-slate-600">{formatFieldName(k)}:</span>
                        <span className="text-sm text-slate-900 font-medium text-right">{v?.toString() || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }
      
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof value === "object") {
      return (
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardContent className="p-4">
            <div className="space-y-2 pt-4">
              {Object.entries(value).map(([k, v]) => (
                <div key={k} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-600">{formatFieldName(k)}:</span>
                  <span className="text-sm text-slate-900 font-medium text-right">{v?.toString() || "N/A"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return <span className="text-slate-900 font-medium">{value.toString()}</span>;
  };

  const renderAnalysisOverview = () => {
    if (!analysisData) return null;
    
    const { overall_rating, criteria_analysis } = analysisData;
    
    return (
      <div className="space-y-6">
        {/* Overall Rating Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-emerald-900">Overall Rating</h3>
                <p className="text-emerald-700">Acquisition Analysis Summary</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-white">{overall_rating?.score}</span>
                </div>
                <p className="font-semibold text-emerald-900">Score</p>
                <p className="text-sm text-emerald-700">out of 5</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="font-semibold text-emerald-900">{overall_rating?.recommendation}</p>
                <p className="text-sm text-emerald-700">Recommendation</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="font-semibold text-emerald-900">{overall_rating?.confidence_level}</p>
                <p className="text-sm text-emerald-700">Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Criteria Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(criteria_analysis || {}).map(([key, analysis]: [string, any]) => (
            <Card key={key} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-800">{formatFieldName(key)}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{analysis.rating}</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">{analysis.assessment}</p>
                {analysis.evidence && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Evidence:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.evidence.map((item: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalysisDetails = () => {
    if (!analysisData) return null;
    
    const { synergies, risks_challenges, strategic_recommendations } = analysisData;
    
    return (
      <div className="space-y-6">
        {/* Synergies */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-green-900">Synergies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Revenue Synergies</h4>
                <ul className="space-y-2">
                  {synergies?.revenue_synergies?.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-green-700 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Cost Synergies</h4>
                <ul className="space-y-2">
                  {synergies?.cost_synergies?.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-green-700 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Capability Synergies</h4>
                <ul className="space-y-2">
                  {synergies?.capability_synergies?.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-green-700 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risks & Challenges */}
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <ExternalLink className="h-6 w-6 text-red-600" />
              <span className="text-xl font-bold text-red-900">Risks & Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(risks_challenges || {}).map(([key, risks]: [string, any]) => (
                <div key={key}>
                  <h4 className="font-semibold text-red-800 mb-3">{formatFieldName(key)}</h4>
                  <ul className="space-y-2">
                    {risks?.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-red-700 flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-blue-900">Strategic Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(strategic_recommendations || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">{formatFieldName(key)}</h4>
                  {Array.isArray(value) ? (
                    <ul className="space-y-1">
                      {value.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-blue-700 flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-blue-700">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalysisSection = () => {
    return (
      <div className="space-y-6">
        {/* Analysis Header with Action Button */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 pt-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-900">Lyzr Analysis</h3>
                  <p className="text-purple-700">AI-powered acquisition analysis and recommendations</p>
                </div>
              </div>
              <Button 
                onClick={() => handleRefresh("analysis")} 
                disabled={refreshing.analysis}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
              >
                {refreshing.analysis ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {analysisData ? "Refresh Analysis" : "Run Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysisData ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white border border-slate-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Overview
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Detailed Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                Analysis History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {renderAnalysisOverview()}
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              {renderAnalysisDetails()}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-4">
                {analysisHistory.map((analysis, idx) => (
                  <Card key={analysis._id} className="bg-white border-slate-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Analysis #{analysisHistory.length - idx}
                        </CardTitle>
                        <Badge variant="outline">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="font-bold text-emerald-600">{analysis.analysis.overall_rating?.score}</span>
                          </div>
                          <p className="text-sm font-medium">Score</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Target className="h-6 w-6 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium">{analysis.analysis.overall_rating?.recommendation}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                          </div>
                          <p className="text-sm font-medium">{analysis.analysis.overall_rating?.confidence_level}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Available</h3>
              <p className="text-gray-600 mb-4">Run a Lyzr analysis to get AI-powered acquisition insights</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderBasicInfo = () => {
    if (!company) return null;
    
    const skipFields = [
      "name", "domain_name", "validation_warnings", "data_sources", 
      "timestamp", "last_updated", "company_id", "logo_url"
    ];
    
    const keyMetrics = [
      { key: "estimated_revenue", icon: DollarSign, label: "Revenue", color: "emerald" },
      { key: "employee_count", icon: Users, label: "Employees", color: "blue" },
      { key: "office_locations", icon: MapPin, label: "Locations", color: "purple" },
      { key: "Industries", icon: Target, label: "Industries", color: "orange" },
    ];

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyMetrics.map(({ key, icon: Icon, label, color }) => {
            const value = company[key];
            if (!value) return null;
            
            return (
              <Card key={key} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200 shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 pt-5">
                    <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 text-${color}-600`} />
                    </div>
                    <div>
                      <p className={`text-${color}-600 text-xs font-medium uppercase tracking-wide`}>{label}</p>
                      <p className={`text-${color}-900 font-bold`}>
                        {Array.isArray(value) ? value.length : value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Information */}
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 pt-5">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
              <span className="text-xl font-bold text-slate-800">Company Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(company)
                .filter(([key]) => !skipFields.includes(key))
                .map(([key, value]) => (
                  <div key={key} className="space-y-3">
                    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors shadow-sm hover:shadow-md">
                      <div className="flex items-center space-x-2 mb-3">
                        <Building2 className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                          {formatFieldName(key)}
                        </span>
                      </div>
                      <div>{renderValue(value)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDataSection = (title: string, data: any, color: string, icon: any, refreshType: "apollo" | "linkedin" | "research") => {
    const Icon = icon;
    
    if (!data) {
      return (
        <Card className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200 shadow-sm`}>
          <CardContent className="p-8 text-center">
            <div className={`w-16 h-16 bg-${color}-100 rounded-2xl mx-auto mb-4 flex items-center justify-center`}>
              <Icon className={`h-8 w-8 text-${color}-600`} />
            </div>
            <h3 className={`text-lg font-semibold text-${color}-900 mb-2`}>No {title} Available</h3>
            <p className={`text-${color}-700 mb-4`}>Refresh to fetch the latest {title.toLowerCase()}</p>
            <Button 
              onClick={() => handleRefresh(refreshType)} 
              disabled={refreshing[refreshType]}
              className={`bg-${color}-600 hover:bg-${color}-700 text-white shadow-lg`}
            >
              {refreshing[refreshType] ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Icon className="h-4 w-4 mr-2" />
              )}
              Refresh {title}
            </Button>
          </CardContent>
        </Card>
      );
    }

    const skipFields = refreshType === "apollo" ? ["id"] : [];

    return (
      <Card className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200 shadow-sm`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 pt-5">
              <div className={`w-10 h-10 bg-${color}-600 rounded-xl flex items-center justify-center`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className={`text-xl font-bold text-${color}-900`}>{title}</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleRefresh(refreshType)} 
              disabled={refreshing[refreshType]}
              className={`border-${color}-300 text-${color}-700 hover:bg-${color}-50 hover:border-${color}-400 shadow-sm`}
            >
              {refreshing[refreshType] ? (
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
              ) : (
                <Database className="h-3 w-3 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data)
              .filter(([key]) => !skipFields.includes(key))
              .map(([key, value]) => (
                <div key={key} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className={`h-4 w-4 text-${color}-600`} />
                    <span className={`text-sm font-semibold text-${color}-700 uppercase tracking-wide`}>
                      {formatFieldName(key)}
                    </span>
                  </div>
                  <div className={`text-${color}-950`}>{renderValue(value)}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-12 shadow-xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Loading Company Profile</h3>
                <p className="text-gray-500">Please wait while we fetch the company information...</p>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-12 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <ExternalLink className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Company</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!company) return null;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent"></div>
          <div className="relative px-8 py-10">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                
                {(company.logo_url || company.data_sources?.linkedin?.raw_data?.logo_url) && (
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <img
                      src={company.logo_url || company.data_sources?.linkedin?.raw_data?.logo_url}
                      alt="Company Logo"
                      className="h-12 w-12 rounded-xl object-contain"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-white">{company.name}</h1>
                    {company.domain_name && (
                      <a
                        href={`https://${company.domain_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-full text-sm font-medium"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {company.domain_name}
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {(company["Broad Category"] || company.Industries || company.Services) && (
                      <Badge className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
                        <Target className="h-3 w-3 mr-1" />
                        {company["Broad Category"] || company.Industries || company.Services}
                      </Badge>
                    )}
                    <Badge className="bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-100">
                      <Award className="h-3 w-3 mr-1" />
                      Active Profile
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b border-gray-200 px-6">
              <TabsList className="bg-transparent h-auto p-0 space-x-8">
                <TabsTrigger 
                  value="overview" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-purple-600 font-medium"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="apollo" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-blue-600 font-medium"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Apollo Data
                </TabsTrigger>
                <TabsTrigger 
                  value="linkedin" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-blue-600 font-medium"
                >
                  <Users className="h-4 w-4 mr-2" />
                  LinkedIn Data
                </TabsTrigger>
                <TabsTrigger 
                  value="research" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-emerald-600 font-medium"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Research Data
                </TabsTrigger>
                <TabsTrigger 
                  value="analysis" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-purple-600 font-medium"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6">
              {renderBasicInfo()}
            </TabsContent>

            <TabsContent value="apollo" className="p-6">
              {renderDataSection(
                "Apollo Data", 
                company?.data_sources?.apollo?.raw_data, 
                "blue", 
                Database, 
                "apollo"
              )}
            </TabsContent>

            <TabsContent value="linkedin" className="p-6">
              {renderDataSection(
                "LinkedIn Data", 
                company?.data_sources?.linkedin?.raw_data, 
                "blue", 
                Users, 
                "linkedin"
              )}
            </TabsContent>

            <TabsContent value="research" className="p-6">
              {renderDataSection(
                "Research Data", 
                company?.data_sources?.lyzr_research?.research_data, 
                "emerald", 
                Search, 
                "research"
              )}
            </TabsContent>

            <TabsContent value="analysis" className="p-6">
              {renderAnalysisSection()}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default CompanyProfilePage;
