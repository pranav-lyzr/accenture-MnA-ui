import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { Button } from "../components/botton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import JsonEditor from "../components/JsonEditor";
import { Loader2, Database, Search, ExternalLink, ArrowLeft, Building2, MapPin, Users, DollarSign, Target, Zap, Award, TrendingUp, RotateCcw } from "lucide-react";
import Layout from "../components/layout/Layout";

const CompanyProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const previousPage = location.state?.from;
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<{ apollo: boolean; linkedin: boolean; research: boolean; analysis: boolean; talent: boolean }>({
    apollo: false,
    linkedin: false,
    research: false,
    analysis: false,
    talent: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [talentAnalysisData, setTalentAnalysisData] = useState<any>(null);
  const [talentAnalysisLoading, setTalentAnalysisLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyEditData, setCompanyEditData] = useState<any>(null);
  const [editingTalent, setEditingTalent] = useState(false);
  const [talentEditData, setTalentEditData] = useState<any>(null);
  const [editingApollo, setEditingApollo] = useState(false);
  const [apolloEditData, setApolloEditData] = useState<any>(null);
  const [editingLinkedIn, setEditingLinkedIn] = useState(false);
  const [linkedInEditData, setLinkedInEditData] = useState<any>(null);
  const [editingResearch, setEditingResearch] = useState(false);
  const [researchEditData, setResearchEditData] = useState<any>(null);
  const [talentAnalysisFullData, setTalentAnalysisFullData] = useState<any>(null);
  const [expandedEmploymentHistory, setExpandedEmploymentHistory] = useState<{[key: string]: boolean}>({});

  const toggleEmploymentHistory = (personId: string) => {
    setExpandedEmploymentHistory(prev => ({
      ...prev,
      [personId]: !prev[personId]
    }));
  };

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
        setAnalysisData(response.data[0].analysis);
      }
    } catch (err) {
      console.error("Error fetching analysis history:", err);
    }
  };

  const handleRefresh = async (type: "apollo" | "linkedin" | "research" | "analysis" | "talent") => {
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
        await fetchAnalysisHistory();
      } else if (type === "talent") {
        const newTalentAnalysis = await api.getTalentAnalysis(id);
        setTalentAnalysisData(newTalentAnalysis.talent_analysis);
        setTalentAnalysisFullData(newTalentAnalysis);
      }
      
      if (type !== "analysis" && type !== "talent") {
        await fetchCompany();
      }
    } catch (err) {
      setError(`Failed to refresh ${type} data.`);
    } finally {
      setRefreshing((prev) => ({ ...prev, [type]: false }));
    }
  };

  const fetchTalentAnalysis = async () => {
    if (!id) return;
    setTalentAnalysisLoading(true);
    console.log(talentAnalysisLoading)
    try {
      const response = await api.getAvailableTalentAnalysis(id);
      if (response.data && response.data.talent_analysis) {
        setTalentAnalysisData(response.data.talent_analysis);
        setTalentAnalysisFullData(response.data);
        console.log("TalentAnalysisData", response.data.talent_analysis);
      }
    } catch (err) {
      console.error("Error fetching talent analysis:", err);
    } finally {
      setTalentAnalysisLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchAnalysisHistory();
    fetchTalentAnalysis();
  }, [id]);

  useEffect(() => {
    setCompanyEditData(company);
  }, [company]);

  useEffect(() => {
    setTalentEditData(talentAnalysisData);
  }, [talentAnalysisData]);

  useEffect(() => {
    setApolloEditData(company?.data_sources?.apollo?.raw_data || null);
  }, [company]);
  useEffect(() => {
    setLinkedInEditData(company?.data_sources?.linkedin?.raw_data || null);
  }, [company]);
  useEffect(() => {
    setResearchEditData(company?.data_sources?.lyzr_research?.research_data || null);
  }, [company]);

  const handleCompanyEditChange = (key: string, value: any) => {
    setCompanyEditData((prev: any) => ({ ...prev, [key]: value }));
  };

  // const handleTalentEditChange = (key: string, value: any) => {
  //   setTalentEditData((prev: any) => ({ ...prev, [key]: value }));
  // };

  const handleSaveCompanyEdit = async () => {
    if (!companyEditData) return;
    await api.updateCompanyData(company._id, companyEditData);
    setEditingCompany(false);
    fetchCompany();
  };

  const handleSaveTalentEdit = async () => {
    if (!talentEditData) return;
    await api.updateTalentAnalysis(
      company._id,
      company.name,
      company.domain_name || "",
      company.linkedin_url || "",
      talentEditData,
      talentAnalysisFullData || {}
    );
    setEditingTalent(false);
    fetchTalentAnalysis();
  };

  const handleApolloEditChange = (key: string, value: any) => {
    setApolloEditData((prev: any) => ({ ...prev, [key]: value }));
  };
  const handleLinkedInEditChange = (key: string, value: any) => {
    setLinkedInEditData((prev: any) => ({ ...prev, [key]: value }));
  };
  const handleResearchEditChange = (key: string, value: any) => {
    setResearchEditData((prev: any) => ({ ...prev, [key]: value }));
  };
  const handleSaveApolloEdit = async () => {
    const updatedCompany = {
      ...company,
      data_sources: {
        ...company.data_sources,
        apollo: {
          ...company.data_sources?.apollo,
          raw_data: apolloEditData,
        },
      },
    };
    await api.updateCompanyData(company._id, updatedCompany);
    setEditingApollo(false);
    await fetchCompany();
  };
  const handleSaveLinkedInEdit = async () => {
    const updatedCompany = {
      ...company,
      data_sources: {
        ...company.data_sources,
        linkedin: {
          ...company.data_sources?.linkedin,
          raw_data: linkedInEditData,
        },
      },
    };
    await api.updateCompanyData(company._id, updatedCompany);
    setEditingLinkedIn(false);
    await fetchCompany();
  };
  const handleSaveResearchEdit = async () => {
    const updatedCompany = {
      ...company,
      data_sources: {
        ...company.data_sources,
        lyzr_research: {
          ...company.data_sources?.lyzr_research,
          research_data: researchEditData,
        },
      },
    };
    await api.updateCompanyData(company._id, updatedCompany);
    setEditingResearch(false);
    await fetchCompany();
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
                      <span className="text-sm font-medium text-slate-600">
                        <b>{formatFieldName(k)}: </b>
                      </span>
                      <span className="text-sm text-slate-900 font-medium text-right">
                        {typeof v === "object" && v !== null ? (
                          <div>
                            {Object.entries(v).map(([subK, subV]) => (
                              <div key={subK}>
                                <b>{formatFieldName(subK)}: </b>{subV?.toString() || "N/A"}<br />
                              </div>
                            ))}
                          </div>
                        ) : v?.toString() || "N/A"}
                      </span>
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
  
    if (typeof value === "object" && value !== null) {
      return (
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardContent className="p-4">
            <div className="space-y-2 pt-4">
              {Object.entries(value).map(([k, v]) => (
                <div key={k} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-600">{formatFieldName(k)}:</span>
                  <span className="text-sm text-slate-900 font-medium text-right">
                    {typeof v === "object" && v !== null ? JSON.stringify(v) : v?.toString() || "N/A"}
                  </span>
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
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">{analysis.assessment}</p>
                  {Object.entries(analysis).map(([subKey, subValue]) => {
                    if (subKey === "rating" || subKey === "assessment") return null;
                    return (
                      <div key={subKey} className="mt-2">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{formatFieldName(subKey)}:</p>
                        {renderValue(subValue)}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalysisDetails = () => {
    if (!analysisData) return null;
    
    const { synergies, risks_challenges, strategic_recommendations, next_steps, data_gaps } = analysisData;
    
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-green-900">Synergies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(synergies || {}).map(([key, value]) => (
                <div key={key}>
                  <h4 className="font-semibold text-green-800 mb-3">{formatFieldName(key)}</h4>
                  {renderValue(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                  {renderValue(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold text-purple-900">Next Steps & Data Gaps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-800 mb-3">Next Steps</h4>
                {renderValue(next_steps)}
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-3">Data Gaps</h4>
                {renderValue(data_gaps)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalysisSection = () => {
    return (
      <div className="space-y-6">
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

  // Helper functions to analyze the new talent data format
  const analyzeTalentData = (talentData: any) => {
    if (!talentData || !talentData.people) return null;

    const people = talentData.people;
    const totalPeople = people.length;
    
    // Analyze seniority levels
    const seniorityLevels = people.reduce((acc: any, person: any) => {
      const seniority = person.seniority || 'unknown';
      acc[seniority] = (acc[seniority] || 0) + 1;
      return acc;
    }, {});

    // Analyze departments
    const departments = people.reduce((acc: any, person: any) => {
      if (person.departments) {
        person.departments.forEach((dept: string) => {
          acc[dept] = (acc[dept] || 0) + 1;
        });
      }
      return acc;
    }, {});

    // Analyze functions
    const functions = people.reduce((acc: any, person: any) => {
      if (person.functions) {
        person.functions.forEach((func: string) => {
          acc[func] = (acc[func] || 0) + 1;
        });
      }
      return acc;
    }, {});

    // Get leadership (C-suite and head level)
    const leadership = people.filter((person: any) => 
      person.seniority === 'c_suite' || person.seniority === 'head'
    );

    // Get technical people
    const technical = people.filter((person: any) => 
      person.departments?.some((dept: string) => dept.includes('engineering') || dept.includes('technical')) ||
      person.functions?.includes('engineering') ||
      person.functions?.includes('information_technology')
    );

    return {
      totalPeople,
      seniorityLevels,
      departments,
      functions,
      leadership,
      technical,
      pagination: talentData.pagination
    };
  };

  const renderTalentAnalysisSection = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 pt-4">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-900">Talent Analysis</h3>
                  <p className="text-orange-700">Employee data and workforce insights</p>
                </div>
              </div>
              <Button 
                onClick={() => handleRefresh("talent")} 
                disabled={refreshing.talent}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
              >
                {refreshing.talent ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                {talentAnalysisData ? "Refresh Analysis" : "Run Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {talentAnalysisData ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white border border-slate-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                Overview
              </TabsTrigger>
              <TabsTrigger value="people" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                People
              </TabsTrigger>
              <TabsTrigger value="leadership" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                Leadership
              </TabsTrigger>
              <TabsTrigger value="technical" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                Technical
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {renderTalentAnalysisOverview()}
            </TabsContent>

            <TabsContent value="people" className="mt-6">
              {renderTalentPeopleAnalysis()}
            </TabsContent>

            <TabsContent value="leadership" className="mt-6">
              {renderTalentLeadershipAnalysis()}
            </TabsContent>

            <TabsContent value="technical" className="mt-6">
              {renderTalentTechnicalAnalysis()}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
            <CardContent className="p-12 pt-5 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Talent Analysis Available</h3>
              <p className="text-gray-600 mb-4">Run a talent analysis to get workforce insights</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTalentAnalysisOverview = () => {
    if (!talentAnalysisData) return null;
    
    const analysis = analyzeTalentData(talentAnalysisData);
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          {!editingTalent ? (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setEditingTalent(true)}
              className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 shadow-sm"
            >
              <Users className="h-3 w-3 mr-2" />
              Human as Loop
            </Button>
          ) : null}
        </div>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-900">Talent Overview</h3>
                <p className="text-orange-700">Workforce Analysis Summary</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">{analysis.totalPeople}</span>
                </div>
                <p className="font-semibold text-orange-900">Total People</p>
                <p className="text-sm text-orange-700">in database</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <p className="font-semibold text-orange-900">{analysis.leadership.length}</p>
                <p className="text-sm text-orange-700">Leadership</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <p className="font-semibold text-orange-900">{analysis.technical.length}</p>
                <p className="text-sm text-orange-700">Technical</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <p className="font-semibold text-orange-900">{analysis.pagination?.total_entries || 0}</p>
                <p className="text-sm text-orange-700">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span className="text-lg font-semibold text-slate-800">Seniority Levels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analysis.seniorityLevels).map(([level]) => (
                  <div key={level} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">{formatFieldName(level)}:</span>
                    <span className="text-sm text-slate-900 font-medium">{formatFieldName(level) as React.ReactNode}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                <span className="text-lg font-semibold text-slate-800">Top Departments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analysis.departments)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">{formatFieldName(dept)}:</span>
                      <span className="text-sm text-slate-900 font-medium">{count as number}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {editingTalent && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                <h4 className="font-semibold text-yellow-800">Edit Raw Talent Data</h4>
                <JsonEditor 
                  value={talentEditData}
                  onChange={(newValue) => setTalentEditData(newValue)}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setEditingTalent(false); setTalentEditData(talentAnalysisData); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTalentEdit}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTalentPeopleAnalysis = () => {
    if (!talentAnalysisData?.people) return null;
    
    const { people } = talentAnalysisData;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {people.map((person: any) => (
            <Card key={person.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-0">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-orange-100">
                  <div className="flex items-start space-x-4">
                    {person.photo_url && person.photo_url !== "https://static.licdn.com/aero-v1/sc/h/9c8pery4andzj6ohjkjp54ma2" ? (
                      <img
                        src={person.photo_url}
                        alt={person.name}
                        className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                        <Users className="h-10 w-10 text-orange-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{person.name}</h3>
                          <p className="text-lg text-slate-700 font-medium mb-2">{person.title}</p>
                          <p className="text-sm text-slate-600 mb-3">{person.headline}</p>
                        </div>
                        <div className="flex gap-2">
                          {person.linkedin_url && (
                            <a
                              href={person.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors shadow-sm text-sm flex"
                              title="LinkedIn Profile"
                            >
                              LinkedIn <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          )}
                          {person.twitter_url && (
                            <a
                              href={person.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                              title="Twitter Profile"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {person.github_url && (
                            <a
                              href={person.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-lg transition-colors shadow-sm"
                              title="GitHub Profile"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {person.seniority && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-medium">
                            {formatFieldName(person.seniority)}
                          </Badge>
                        )}
                        {person.email_status && (
                          <Badge variant="outline" className={`${
                            person.email_status === 'verified' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            Email: {person.email_status}
                          </Badge>
                        )}
                      </div>

                      {/* Location & Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {(person.city || person.state || person.country) && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-700">
                              {[person.city, person.state, person.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        {person.email && person.email !== "email_not_unlocked@domain.com" && (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-500">✉</span>
                            <span className="text-slate-700">{person.email}</span>
                          </div>
                        )}
                        {person.revealed_for_current_team && (
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-green-700 text-xs">Revealed Contact</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Information Sections */}
                <div className="p-6 space-y-6">
                  
                  {/* Departments and Functions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {person.departments && person.departments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                          Departments
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {person.departments.map((dept: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {formatFieldName(dept)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {person.functions && person.functions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-green-600" />
                          Functions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {person.functions.map((func: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {formatFieldName(func)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subdepartments */}
                  {person.subdepartments && person.subdepartments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-purple-600" />
                        Subdepartments
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {person.subdepartments.map((subdept: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {formatFieldName(subdept)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Employment History */}
                  {person.employment_history && person.employment_history.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-indigo-600" />
                        Employment History ({person.employment_history.length} positions)
                      </h4>
                      <div className="space-y-3">
                        {(expandedEmploymentHistory[person.id] 
                          ? person.employment_history 
                          : person.employment_history.slice(0, 2)
                        ).map((job: any, idx: number) => (
                          <div key={idx} className={`bg-slate-50 border-l-4 ${
                            job.current ? 'border-green-500 bg-green-50' : 'border-slate-300'
                          } p-4 rounded-r-lg`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-semibold text-slate-900">{job.title}</h5>
                                  {job.current && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
                                  )}
                                </div>
                                <p className="text-slate-700 font-medium mb-1">{job.organization_name}</p>
                                <div className="flex items-center space-x-4 text-sm text-slate-600">
                                  <span className="flex items-center">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>
                                    {job.start_date ? new Date(job.start_date).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short' 
                                    }) : 'Unknown start'}
                                  </span>
                                  <span>→</span>
                                  <span className="flex items-center">
                                    <span className={`w-2 h-2 ${job.current ? 'bg-green-500' : 'bg-slate-400'} rounded-full mr-2`}></span>
                                    {job.end_date ? new Date(job.end_date).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short' 
                                    }) : 'Present'}
                                  </span>
                                  {job.start_date && (job.end_date || job.current) && (
                                    <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                                      {calculateDuration(job.start_date, job.end_date)}
                                    </span>
                                  )}
                                </div>
                                {job.description && (
                                  <p className="text-sm text-slate-600 mt-2">{job.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {person.employment_history.length > 2 && (
                          <button
                            onClick={() => toggleEmploymentHistory(person.id)}
                            className="w-full mt-3 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            {expandedEmploymentHistory[person.id] ? (
                              <>
                                <span>Show Less</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </>
                            ) : (
                              <>
                                <span>View All {person.employment_history.length} Positions</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  

                  {/* Additional Metadata */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <Database className="h-4 w-4 mr-2 text-slate-600" />
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <span className="text-slate-600">Person ID:</span>
                        <p className="font-mono text-xs text-slate-900 mt-1">{person.id}</p>
                      </div>
                      {person.intent_strength && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <span className="text-slate-600">Intent Strength:</span>
                          <p className="text-slate-900 font-medium mt-1">{person.intent_strength}</p>
                        </div>
                      )}
                      {person.extrapolated_email_confidence && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <span className="text-slate-600">Email Confidence:</span>
                          <p className="text-slate-900 font-medium mt-1">{person.extrapolated_email_confidence}</p>
                        </div>
                      )}
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <span className="text-slate-600">Show Intent:</span>
                        <p className="text-slate-900 font-medium mt-1">{person.show_intent ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <span className="text-slate-600">Email Catchall:</span>
                        <p className="text-slate-900 font-medium mt-1">{person.email_domain_catchall ? 'Yes' : 'No'}</p>
                      </div>
                      {person.organization_id && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <span className="text-slate-600">Org ID:</span>
                          <p className="font-mono text-xs text-slate-900 mt-1">{person.organization_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* {talentAnalysisData.pagination && (
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Showing {talentAnalysisData.pagination.per_page} of {talentAnalysisData.pagination.total_entries} people
              (Page {talentAnalysisData.pagination.page} of {talentAnalysisData.pagination.total_pages})
            </p>
          </div>
        )} */}
      </div>
    );
  };

  // Helper function to calculate duration between dates
  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);
    
    if (diffYears > 0) {
      const remainingMonths = diffMonths % 12;
      return `${diffYears}y ${remainingMonths > 0 ? remainingMonths + 'm' : ''}`.trim();
    } else if (diffMonths > 0) {
      return `${diffMonths}m`;
    } else {
      return `${diffDays}d`;
    }
  };

  const renderTalentLeadershipAnalysis = () => {
    if (!talentAnalysisData?.people) return null;
    
    const analysis = analyzeTalentData(talentAnalysisData);
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold text-purple-900">Leadership Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.leadership.map((person: any) => (
                <Card key={person.id} className="bg-white border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {person.photo_url ? (
                        <img 
                          src={person.photo_url} 
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{person.name}</h4>
                        <p className="text-sm text-slate-600 truncate">{person.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">
                            {formatFieldName(person.seniority)}
                          </Badge>
                          {person.linkedin_url && (
                            <a 
                              href={person.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {person.employment_history && person.employment_history.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-500">Previous:</p>
                            {person.employment_history
                              .filter((job: any) => !job.current)
                              .slice(0, 2)
                              .map((job: any, idx: number) => (
                                <p key={idx} className="text-xs text-slate-600 truncate">
                                  {job.title} at {job.organization_name}
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTalentTechnicalAnalysis = () => {
    if (!talentAnalysisData?.people) return null;
    
    const analysis = analyzeTalentData(talentAnalysisData);
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-green-900">Technical Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.technical.map((person: any) => (
                <Card key={person.id} className="bg-white border-slate-200 shadow-sm pt-5">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {person.photo_url ? (
                        <img 
                          src={person.photo_url} 
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Zap className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{person.name}</h4>
                        <p className="text-sm text-slate-600 truncate">{person.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
                            {formatFieldName(person.seniority)}
                          </Badge>
                          {person.linkedin_url && (
                            <a 
                              href={person.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {person.functions && person.functions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {person.functions.map((func: string) => (
                              <Badge key={func} variant="secondary" className="text-xs">
                                {formatFieldName(func)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBasicInfo = () => {
    if (!company) return null;

    const keyMetrics = [
      { key: "estimated_revenue", icon: DollarSign, label: "Revenue", color: "emerald" },
      { key: "employee_count", icon: Users, label: "Employees", color: "blue" },
      { key: "office_locations", icon: MapPin, label: "Locations", color: "purple" },
      { key: "Industries", icon: Target, label: "Industries", color: "orange" },
    ];

    const priorityFields = [
      "name", "domain_name", "Broad Category", "Industries", "Services", "ownership",
      "estimated_revenue", "employee_count", "office_locations", "revenue_growth",
      "key_clients", "leadership", "merger_synergies", "sources", "validation_warnings"
    ];

    const otherFields = Object.keys(company).filter(
      (key) => !priorityFields.includes(key) && key !== "data_sources" && key !== "last_updated"
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          {!editingCompany ? (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setEditingCompany(true)}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 shadow-sm"
            >
              <Users className="h-3 w-3 mr-2" />
              Human as Loop
            </Button>
          ) : null}
        </div>
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

        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 pt-5">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
              <span className="text-xl font-bold text-slate-800">Company Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="columns-1 md:columns-2 gap-4 space-y-6">
              {priorityFields.map((key) => {
                if (!company[key]) return null;
                return (
                  <div key={key} className="break-inside-avoid mb-6">
                    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors shadow-sm hover:shadow-md">
                      <div className="flex items-center space-x-2 mb-3">
                        <Building2 className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                          {formatFieldName(key)}
                        </span>
                      </div>
                      <div>
                        {editingCompany ? (
                          typeof companyEditData?.[key] === "object" && companyEditData?.[key] !== null ? (
                            <JsonEditor 
                              value={companyEditData[key]}
                              onChange={(newValue) => handleCompanyEditChange(key, newValue)}
                            />
                          ) : (
                            <input
                              className="border rounded px-2 py-1 w-full border-gray-200"
                              value={companyEditData?.[key] || ""}
                              onChange={e => handleCompanyEditChange(key, e.target.value)}
                            />
                          )
                        ) : (
                          renderValue(company[key])
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {otherFields.map((key) => (
                <div key={key} className="break-inside-avoid mb-6">
                  <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-2 mb-3">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                        {formatFieldName(key)}
                      </span>
                    </div>
                    <div>
                      {editingCompany ? (
                        typeof companyEditData?.[key] === "object" && companyEditData?.[key] !== null ? (
                          <JsonEditor 
                            value={companyEditData[key]}
                            onChange={(newValue) => handleCompanyEditChange(key, newValue)}
                          />
                        ) : (
                          <input
                            className="border rounded px-2 py-1 w-full border-gray-200"
                            value={companyEditData?.[key] || ""}
                            onChange={e => handleCompanyEditChange(key, e.target.value)}
                          />
                        )
                      ) : (
                        renderValue(company[key])
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {editingCompany && (
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="outline" onClick={() => { setEditingCompany(false); setCompanyEditData(company); }}>Cancel</Button>
                <Button onClick={handleSaveCompanyEdit}>Save</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDataSection = (title: string, data: any, color: string, refreshType: "apollo" | "linkedin" | "research") => {
    let editing: boolean = false,
      setEditing: React.Dispatch<React.SetStateAction<boolean>> = () => {},
      editData: any = {},
      setEditData: React.Dispatch<React.SetStateAction<any>> = () => {},
      handleEditChange: (key: string, value: any) => void = () => {},
      handleSaveEdit: () => Promise<void> = async () => {};
    if (refreshType === "apollo") {
      editing = editingApollo;
      setEditing = setEditingApollo;
      editData = apolloEditData;
      setEditData = setApolloEditData;
      handleEditChange = handleApolloEditChange;
      handleSaveEdit = handleSaveApolloEdit;
    } else if (refreshType === "linkedin") {
      editing = editingLinkedIn;
      setEditing = setEditingLinkedIn;
      editData = linkedInEditData;
      setEditData = setLinkedInEditData;
      handleEditChange = handleLinkedInEditChange;
      handleSaveEdit = handleSaveLinkedInEdit;
    } else if (refreshType === "research") {
      editing = editingResearch;
      setEditing = setEditingResearch;
      editData = researchEditData;
      setEditData = setResearchEditData;
      handleEditChange = handleResearchEditChange;
      handleSaveEdit = handleSaveResearchEdit;
    }
    if (!data) {
      return (
        <Card className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200 shadow-sm`}>
          <CardContent className="p-8 text-center">
            <div className={`w-16 h-16 bg-${color}-100 rounded-2xl mx-auto mb-4 flex items-center justify-center`}>
              {refreshType === "apollo" && <Database className={`h-8 w-8 text-${color}-600`} />}
              {refreshType === "linkedin" && <Users className={`h-8 w-8 text-${color}-600`} />}
              {refreshType === "research" && <Search className={`h-8 w-8 text-${color}-600`} />}
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
                <Database className="h-4 w-4 mr-2" />
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
                {refreshType === "apollo" && <Database className="h-5 w-5 text-white" />}
                {refreshType === "linkedin" && <Users className="h-5 w-5 text-white" />}
                {refreshType === "research" && <Search className="h-5 w-5 text-white" />}
              </div>
              <span className={`text-xl font-bold text-${color}-900`}>{title}</span>
            </CardTitle>
            <div className="flex gap-2">
              {!editing ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className={`border-${color}-300 text-${color}-700 hover:bg-${color}-50 hover:border-${color}-400 shadow-sm`}
                >
                  <Users className="h-3 w-3 mr-2" />
                  Human as Loop
                </Button>
              ) : null}
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
                  <RotateCcw className="h-3 w-3 mr-2" />
                )}
                Refresh {title}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {Object.entries(data)
              .filter(([key]) => !skipFields.includes(key))
              .map(([key, value]) => (
                <div key={key} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    {refreshType === "apollo" && <Database className={`h-4 w-4 text-${color}-600`} />}
                    {refreshType === "linkedin" && <Users className={`h-4 w-4 text-${color}-600`} />}
                    {refreshType === "research" && <Search className={`h-4 w-4 text-${color}-600`} />}
                    <span className={`text-sm font-semibold text-${color}-700 uppercase tracking-wide`}>
                      {formatFieldName(key)}
                    </span>
                  </div>
                  <div className={`text-${color}-950`}>
                    {editing ? (
                      typeof editData?.[key] === "object" && editData?.[key] !== null ? (
                        <JsonEditor 
                          value={editData[key]}
                          onChange={(newValue) => handleEditChange(key, newValue)}
                        />
                      ) : (
                        <input
                          className="border rounded px-2 py-1 w-full border-gray-200"
                          value={editData?.[key] || ""}
                          onChange={e => handleEditChange(key, e.target.value)}
                        />
                      )
                    ) : (
                      renderValue(value)
                    )}
                  </div>
                </div>
              ))}
          </div>
          {editing && (
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => { setEditing(false); setEditData(data); }}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          )}
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
      <div className="p-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4 mt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-purple-700 hover:underline focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          {previousPage && (
            <>
              <span className="mx-2">/</span>
              <span className="capitalize">{previousPage}</span>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="font-semibold text-gray-900">{company?.name}</span>
        </div>
        <div className="space-y-8">
          <div className="w-full bg-purple-50 rounded-2xl p-6 flex items-center gap-6 mb-6 border border-purple-200">
            {(company.logo_url || company.data_sources?.apollo?.raw_data?.logo_url  || company.data_sources?.linkedin?.raw_data?.logo_url) ? (
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow">
                <img
                  src={company.logo_url || company.data_sources?.apollo?.raw_data?.logo_url || company.data_sources?.linkedin?.raw_data?.logo_url}
                  alt="Company Logo"
                  className="h-12 w-12 rounded-xl object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-purple-400 rounded-2xl flex items-center justify-center shadow">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-purple-900">{company.name}</h1>
                {company.domain_name && (
                  <a
                    href={`https://${company.domain_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-purple-100 border border-white/20 text-purple-700 hover:bg-purple-200 transition-all duration-200 rounded-full text-sm font-medium"
                  >
                    {company.domain_name}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                )}
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(company.Industries || company["Broad Category"] || company.Services) &&
                  (Array.isArray(company.Industries)
                    ? company.Industries.split(", ")
                    : [company.Industries || company["Broad Category"] || company.Services]
                  ).map((item: string, idx: number) =>
                    item ? (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        {item}
                      </span>
                    ) : null
                  )}
              </div>
            </div>
          </div>
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
                    value="talent" 
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-gray-600 data-[state=active]:text-orange-600 font-medium"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Talent Analysis
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
                  "apollo"
                )}
              </TabsContent>

              <TabsContent value="linkedin" className="p-6">
                {renderDataSection(
                  "LinkedIn Data", 
                  company?.data_sources?.linkedin?.raw_data, 
                  "blue", 
                  "linkedin"
                )}
              </TabsContent>

              <TabsContent value="research" className="p-6">
                {renderDataSection(
                  "Research Data", 
                  company?.data_sources?.lyzr_research?.research_data, 
                  "emerald", 
                  "research"
                )}
              </TabsContent>

              <TabsContent value="talent" className="p-6">
                {renderTalentAnalysisSection()}
              </TabsContent>

              <TabsContent value="analysis" className="p-6">
                {renderAnalysisSection()}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

      </div>
      
    </Layout>
  );
};

export default CompanyProfilePage;