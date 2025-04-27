export interface CompanyDetails {
  name: string;
  rank?: number;
  primary_domains?: string;
  competitive_advantage?: string;
  market_penetration?: string;
  technological_enablement_score?: string;
  notable_retail_clients?: string;
  unique_procurement_methodology?: string;
  global_sourcing_reach?: string;
  supply_chain_optimization_domains?: string; // Add new fields from the API
  digital_transformation_score?: string;
  sustainability_performance?: string;
  unique_methodology?: string;
  representative_technology_stack?: string;
  sources?: string[];
  [key: string]: string | string[] | number | undefined; // Allow arbitrary fields
}

// Update the MergerSearchResponse interface to use AnalysisData
export interface MergerSearchResponse {
  results: {
    consolidated_companies: string[];
    claude_analysis: AnalysisData;
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

export interface SearchResponse {
  title: string;
  raw_response: {
    companies: CompanyDetails[];
  };
  extracted_companies: string[];
  sources: string[];
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