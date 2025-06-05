// Base API URL - would typically come from environment variables
const API_BASE_URL = 'https://accenture-mna.ca.lyzr.app';
// const API_BASE_URL = 'http://localhost:8002';
export interface Prompt {
  index: number;
  title: string;
  'agent-ID': string;
}

export interface PromptResponse {
  title: string;
  raw_response?: CompanyDetails[]; 
  sources?: string[];
  validation_warnings?: string[];
  document_id: string;
}

export interface CompanyDetails {
  name: string;
  domain_name?: string;
  estimated_revenue?: string; // String in response (e.g., "$35M")
  revenue_growth?: string;
  employee_count?: string; // String in response (e.g., "170 employees")
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
}

export interface PromptHistoryItem {
  prompt_index: number;
  title: string;
  custom_message: string | null;
  prompt_content: string;
  raw_response: CompanyDetails[];
  extracted_companies: string[];
  validation_warnings: string[];
  timestamp: string;
  document_id: string;
}

export interface CompanyData {
  name: string;
  revenue?: string;
  specialization?: string;
  clientProfile?: string;
  uniqueDifferentiation?: string;
}

export interface AnalysisData {
  top_candidates: {
    rank: number;
    name: string;
    reason: string;
    valuation: string;
    strategic_fit: string;
    synergies: string;
    challenges: string;
    references: string[];
  }[];
  recommended_candidate: {
    name: string;
    justification: string;
  };
}

export interface MergerSearchResponse {
  results: {
    [key: string]: any;
    consolidated_companies: string[];
    claude_analysis?: AnalysisData;
  };
  message: string;
}

export interface EnrichCompanyRequest {
  company_domain: string;
}

export interface FetchCompanyPerplexityRequest {
  company_name: string;
  company_domain: string;
}

interface AnalysisRequest {
  companies: Array<{
    name: string;
    domain_name?: string;
    estimated_revenue?: string;
    revenue_growth?: string;
    employee_count?: string;
    key_clients?: string[];
    leadership?: Array<{
      [key: string]: string;
    }>;
    merger_synergies?: string;
    Industries?: string | string[];
    Services?: string;
    Broad_Category?: string;
    Ownership?: string;
    sources?: string[];
    office_locations?: string[];
    validation_warnings?: string[];
  }>;
}

interface AnalysisResponse {
  analysis: {
    rankings: Array<{
      name: string;
      overall_score: number;
      financial_health_score: number;
      strategic_fit_score: number;
      operational_compatibility_score: number;
      leadership_innovation_score: number;
      cultural_integration_score: number;
      rationale: string;
    }>;
    recommendations: Array<{
      name: string;
      merger_potential: string;
      key_synergies: string[];
      potential_risks: string[];
    }>;
    summary: string;
  };
}
// API service functions
const api = {
  // Get all available prompts
  getPrompts: async (): Promise<Prompt[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }
  },

  // Run a specific prompt
  runPrompt: async (promptIndex: number, customMessage?: string): Promise<PromptResponse> => {
    try {
      const body: { prompt_index: number; custom_message?: string } = { prompt_index: promptIndex };
      if (customMessage) {
        body.custom_message = customMessage;
      }
      const response = await fetch(`${API_BASE_URL}/run_prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error running prompt ${promptIndex}:`, error);
      throw error;
    }
  },
  
  // Get prompt history
  getPromptHistory: async (): Promise<PromptHistoryItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompt_history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching prompt history:', error);
      return [];
    }
  },

  // Run the full merger search process
  runMergerSearch: async (): Promise<MergerSearchResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/run_merger_search`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error running merger search:', error);
      throw error;
    }
  },

  // Get saved results
  getResults: async (): Promise<MergerSearchResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/results`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  },

  // Redo search
  redoSearch: async (): Promise<MergerSearchResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/redo_search`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error redoing search:', error);
      throw error;
    }
  },

  // Fetch existing items
  fetchExistingItems: async (): Promise<{ results: any; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch_existing_items`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching existing items:', error);
      throw error;
    }
  },

  // Enrich company with Apollo API
  enrichCompanyApollo: async (companyDomain: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch_company_apollo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_domain: companyDomain }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error enriching company with Apollo:', error);
      throw error;
    }
  },

  // Enrich company with Perplexity API
  enrichCompanyPerplexity: async (companyName: string, companyDomain: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch_company_perplexity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          company_name: companyName,
          company_domain: companyDomain 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error enriching company with Perplexity:', error);
      throw error;
    }
  },

  analyzeCompanies: async (request: AnalysisRequest): Promise<AnalysisResponse> => {
    try {
      console.log('Sending analysis request:', request);

      // Prepare the request body
      const body = {
        companies: request.companies.map(company => ({
          name: company.name,
          domain_name: company.domain_name || '',
          estimated_revenue: company.estimated_revenue || 'Unknown',
          revenue_growth: company.revenue_growth || 'Unknown',
          employee_count: company.employee_count || 'Unknown',
          key_clients: company.key_clients || [],
          leadership: company.leadership || [],
          merger_synergies: company.merger_synergies || 'Unknown',
          Industries: Array.isArray(company.Industries)
            ? company.Industries.join(', ')
            : company.Industries || 'General',
          Services: company.Services || 'Unknown',
          Broad_Category: company.Broad_Category || 'Unknown',
          Ownership: company.Ownership || 'Unknown',
          sources: company.sources || [],
          office_locations: company.office_locations || [],
          validation_warnings: company.validation_warnings || [],
        })),
      };

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling /analyze API:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  },

  // Fetch all unique companies with full data
getCompanies: async (): Promise<CompanyData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
},

  // Download CSVs and JSONs
  downloadCSV: () => {
    window.open(`${API_BASE_URL}/download_csv`, '_blank');
  },

  downloadJSON: () => {
    window.open(`${API_BASE_URL}/download_json`, '_blank');
  },


};

export default api;
