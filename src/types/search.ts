export interface CompanyDetails {
  name: string;
  domain_name?: string;
  estimated_revenue?: string;
  employee_count?: string;
  Industries?: string | string[];
  Services?: string | string[];
  [key: string]: any; // Allow additional properties
}

// Update the MergerSearchResponse interface to use AnalysisData
export interface MergerSearchResponse {
  results: {
    [key: string]: {
      raw_response: any;
      extracted_companies: CompanyDetails[];
      validation_warnings?: string[];
    };
  };
}

// AnalysisData should include both rankings and recommendations
export interface AnalysisData {
  rankings: Array<{
    name: string;
    rationale: string;
    overall_score: string;
    financial_health_score: string;
    strategic_fit_score: string;
  }>;
  recommendations: Array<{
    name: string;
    key_synergies: string[];
    potential_risks: string[];
  }>;
}

export interface Company {
  rank: BigInteger,
  name: string;
  domain_name: string;
  estimated_revenue: string;
  revenue_growth: string;
  profitability: string;
  valuation_estimate: string;
  employee_count: string;
  office_locations: string[];
  key_clients: string[];
  average_contract_value: string;
  leadership: { name: string; title: string; experience: string }[];
  primary_domains: string[];
  proprietary_methodologies: string;
  technology_tools: string[];
  competitive_advantage: string;
  merger_synergies: string;
  cultural_alignment: string;
  integration_challenges: string;
  market_penetration: string;
  sources?: string[]; // Optional, as it may only appear in some formats
  [key: string]: any; // For flexibility with additional fields
}

export interface SearchResponse {
  title: string;
  response: any;
  companies: CompanyDetails[];
  sources: string[];
  validation_warnings?: string[];
}



export interface AnalysisData {
  rankings: Array<{
    name: string;
    rationale: string;
    overall_score: string;
    financial_health_score: string;
    strategic_fit_score: string;
  }>;
  recommendations: Array<{
    name: string;
    key_synergies: string[];
    potential_risks: string[];
  }>;
}