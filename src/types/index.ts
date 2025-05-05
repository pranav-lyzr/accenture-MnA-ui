export interface CompanyData {
  name: string;
  domain_name?: string;
  revenue?: string;
  estimated_revenue?: string;
  specialization?: string;
  uniqueDifferentiation?: string;
  clientProfile?: string;
  employee_count?: string;
  [key: string]: any;
}