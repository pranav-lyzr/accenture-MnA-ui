import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, FileText } from 'lucide-react';
import { Button } from "../../components/botton";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardHeader, CardContent, CardFooter } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ShortlistedCompany } from "../../types/company";

interface CompanyActionCardProps {
  company: ShortlistedCompany;
  onStatusChange: (id: string, status: 'shortlisted' | 'rejected' | 'pending') => void;
  onNoteChange: (id: string, note: string) => void;
  onViewDetails: (company: any) => void;
}

const CompanyActionCard: React.FC<CompanyActionCardProps> = ({ 
  company, 
  onStatusChange,
  onNoteChange,
  onViewDetails
}) => {
  const [notes, setNotes] = useState(company.notes || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onNoteChange(company.id, newNotes);
  };

  const getStatusColor = () => {
    switch (company.status) {
      case 'shortlisted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className={`border-l-4 ${
      company.status === 'shortlisted' ? 'border-l-green-500' : 
      company.status === 'rejected' ? 'border-l-red-500' : 
      'border-l-gray-300'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <p className="text-sm text-gray-500">Last updated: {formatDate(company.timestamp)}</p>
          </div>
          <Badge className={getStatusColor()}>
            {company.status === 'shortlisted' && 'Shortlisted'}
            {company.status === 'rejected' && 'Rejected'}
            {company.status === 'pending' && 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {isExpanded && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes:</label>
            <Textarea
              placeholder="Add your notes here..."
              className="w-full"
              value={notes}
              onChange={handleNotesChange}
            />
            
            <div className="mt-3">
              <h4 className="text-sm font-medium">Company Details:</h4>
              <ul className="mt-1 text-sm text-gray-600">
                {company.details.revenue && (
                  <li><span className="font-semibold">Revenue:</span> {company.details.revenue}</li>
                )}
                {company.details.employee_count && (
                  <li><span className="font-semibold">Employees:</span> {company.details.employee_count}</li>
                )}
                {company.details.specialization && (
                  <li><span className="font-semibold">Specialization:</span> {company.details.specialization}</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-wrap justify-between items-center gap-2">
        <div className="flex gap-1">
          <Button 
            variant={company.status === 'shortlisted' ? 'default' : 'outline'} 
            onClick={() => onStatusChange(company.id, 'shortlisted')}
            className="flex gap-1 items-center"
          >
            <CheckCircle className="h-4 w-4" />
            Shortlist
          </Button>
          
          <Button 
            variant={company.status === 'rejected' ? 'destructive' : 'outline'} 
            onClick={() => onStatusChange(company.id, 'rejected')}
            className="flex gap-1 items-center"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => onStatusChange(company.id, 'pending')}
            className="flex gap-1 items-center"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
          
          <Button
            onClick={() => onViewDetails(company.details)}
            className="flex gap-1 items-center"
          >
            <FileText className="h-4 w-4" />
            Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CompanyActionCard;
