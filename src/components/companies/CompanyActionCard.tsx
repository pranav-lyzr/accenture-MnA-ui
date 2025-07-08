
import { Check, X } from 'lucide-react';
import { Button } from '../botton';
import { ShortlistedCompany } from '../../types/company';

interface CompanyActionCardProps {
  company: ShortlistedCompany;
  onStatusChange: (id: string, status: "shortlisted" | "rejected" | "pending") => void;
  onNoteChange: (id: string, notes: string) => void;
  onViewDetails: (company: any) => void;
}

const CompanyActionCard = ({ company, onStatusChange, onNoteChange }: CompanyActionCardProps) => {
  return (
    <div className={`p-4 border rounded-lg ${
      company.status === 'shortlisted' ? 'border-green-200 bg-green-50' :
      company.status === 'rejected' ? 'border-red-200 bg-red-50' :
      'border-gray-200 bg-white'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900">{company.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${
          company.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
          company.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {company.details.revenue && (
          <p><span className="font-medium">Revenue:</span> {company.details.revenue}</p>
        )}
        {company.details.employee_count && (
          <p><span className="font-medium">Employees:</span> {company.details.employee_count}</p>
        )}
        {company.details.specialization && (
          <p><span className="font-medium">Specialization:</span> {company.details.specialization}</p>
        )}
      </div>

      <textarea
        value={company.notes || ''}
        onChange={(e) => onNoteChange(company.id, e.target.value)}
        placeholder="Add notes..."
        className="w-full p-2 border border-gray-300 rounded-md text-sm mb-3 resize-none"
        rows={2}
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={company.status === 'shortlisted' ? 'default' : 'outline'}
          onClick={() => onStatusChange(company.id, 'shortlisted')}
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-1" />
          Shortlist
        </Button>
        <Button
          size="sm"
          variant={company.status === 'rejected' ? 'destructive' : 'outline'}
          onClick={() => onStatusChange(company.id, 'rejected')}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-1" />
          Reject
        </Button>
        {/* <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(company)}
        >
          <FileText className="w-4 h-4" />
        </Button> */}
      </div>
    </div>
  );
};

export default CompanyActionCard;