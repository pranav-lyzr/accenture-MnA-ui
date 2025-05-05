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