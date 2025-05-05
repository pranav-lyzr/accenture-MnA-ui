// Base API URL - would typically come from environment variables
const API_BASE_URL = 'https://accenture-mna.ca.lyzr.app';
// const API_BASE_URL = 'http://localhost:8002';
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

export interface EnrichCompanyRequest {
  company_domain: string;
}

export interface FetchCompanyPerplexityRequest {
  company_name: string;
  company_domain: string;
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

  // Download CSVs and JSONs
  downloadCSV: () => {
    window.open(`${API_BASE_URL}/download_csv`, '_blank');
  },

  downloadJSON: () => {
    window.open(`${API_BASE_URL}/download_json`, '_blank');
  },
};

export default api;
