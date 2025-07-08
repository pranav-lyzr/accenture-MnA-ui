export interface ShortlistedCompany {
  id: string;
  name: string;
  status: 'shortlisted' | 'rejected' | 'pending';
  details: any;
  notes?: string;
  timestamp: number;
}

export interface CompanyStatus {
  [companyId: string]: ShortlistedCompany;
}

export interface CompanyCardProps {
  _id: string;
  name: string;
  domain_name?: string;
  office_locations?: string[];
  estimated_revenue?: string;
  revenue?: string;
  revenue_growth?: string;
  employee_count?: string;
  key_clients?: string[];
  leadership?: Array<{ [key: string]: string }>;
  merger_synergies?: string;
  Industries?: string | string[];
  Services?: string;
  Broad_Category?: string;
  Ownership?: string;
  sources?: string[];
  validation_warnings?: string[];
  status?: "shortlisted" | "rejected" | "pending";
}