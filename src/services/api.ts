// Base API URL - would typically come from environment variables
const API_BASE_URL = 'https://accenture-mna.lyzr.app';
// const API_BASE_URL = 'http://localhost:8002';

// Type definitions for API responses
export interface Prompt {
  index: number;
  title: string;
}

export interface PromptResponse {
  title: string;
  raw_response: any;
  extracted_companies: string[];
  sources: string[];
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


export interface EnrichedCompanyData {
  id: string;
  name: string;
  website_url: string;
  linkedin_url: string;
  twitter_url: string;
  facebook_url: string;
  primary_phone: {
    number: string;
    source: string;
    sanitized_number: string;
  };
  phone: string;
  founded_year: number;
  logo_url: string;
  primary_domain: string;
  industry: string;
  keywords: string[];
  estimated_num_employees: number;
  industries: string[];
  raw_address: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  seo_description: string;
  short_description: string;
  annual_revenue: number;
  technology_names: string[];
  current_technologies: { uid: string; name: string; category: string }[];
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
  runPrompt: async (promptIndex: number): Promise<PromptResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/run_prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt_index: promptIndex }),
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

  enrichCompany: async (companyDomain: string): Promise<EnrichedCompanyData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/enrich_company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ company_domain: companyDomain }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error enriching company:', error);
      throw error;
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
