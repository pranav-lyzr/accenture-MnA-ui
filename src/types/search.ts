// CompanyDetails interface for detailed company information
export interface CompanyDetails {
  name: string;
  domain_name?: string;
  estimated_revenue?: string; // e.g., "$20M"
  revenue_growth?: string;
  employee_count?: string; // e.g., "60" or "2 employees"
  key_clients?: string[];
  leadership?: Array<{ name: string; title: string }>;
  merger_synergies?: string;
  Industries?: string;
  Services?: string;
  Broad_Category?: string;
  Ownership?: string;
  sources?: string[];
  office_locations?: string[];
  validation_warnings?: string[];
  [key: string]: any;
}

// Single SearchResponse interface
export interface SearchResponse {
  title: string;
  response: CompanyDetails[]; // Array of company details
  companies: string[]; // Array of company names
  sources: string[];
  validation_warnings?: string[];
  document_id?: string;
}

// MergerSearchResponse interface
export interface MergerSearchResponse {
  results: {
    [key: string]: {
      raw_response: any;
      extracted_companies: CompanyDetails[];
      validation_warnings?: string[];
    };
  };
}

// AnalysisData interface (single definition)
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

// Company interface with BigInteger replaced by bigint
export interface Company {
  rank: bigint; // Use bigint instead of BigInteger (or number if bigint is not suitable)
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