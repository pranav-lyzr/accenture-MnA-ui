// components/analysis/CompanySelection.tsx
import { useState, useMemo } from 'react';
import { Search, CheckSquare, Square } from 'lucide-react';
import { Button } from '../../components/botton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';

interface CompanyCardProps {
  name: string;
  office_locations?: string[];
  estimated_revenue?: string;
  revenue?: string;
  Industries?: string | string[];
  industry?: string | string[];
  status?: "shortlisted" | "rejected" | "pending";
}

interface Filters {
  office_locations: string[]; // Changed to string[] to allow multiple selections
  revenue: string;
  industry: string;
}

interface CompanySelectionProps {
  companies: CompanyCardProps[];
  filters: Filters;
  selectedCompanies: string[];
  onSelectCompanies: (selected: string[]) => void;
  categorizeRevenue: (revenue: string) => string;
}

const CompanySelection = ({
  companies,
  filters,
  selectedCompanies,
  onSelectCompanies,
  categorizeRevenue,
}: CompanySelectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and search companies
  const filteredCompanies = useMemo(() => {
    return companies
      .filter(company => {
        // Office locations filter
        const locations = company.office_locations || ['Unknown'];
        const locationMatch =
          filters.office_locations.length === 0 || // If no locations selected, match all
          filters.office_locations.some(selectedLocation =>
            locations.includes(selectedLocation)
          ); // Match if any selected location is in the company's locations

        // Revenue filter
        const revenue = company.estimated_revenue || company.revenue || 'Unknown';
        const revenueRange = categorizeRevenue(revenue);
        const revenueMatch = filters.revenue === 'All' || revenueRange === filters.revenue;

        // Industry filter
        const industries = company.Industries || company.industry || ['General'];
        const industryList = Array.isArray(industries) ? industries : [industries];
        const industryMatch = filters.industry === 'All' || industryList.includes(filters.industry);

        // Search term filter
        const searchMatch = company.name.toLowerCase().includes(searchTerm.toLowerCase());

        return locationMatch && revenueMatch && industryMatch && searchMatch;
      })
      .sort((a, b) => {
        let valueA: any = a[sortColumn as keyof CompanyCardProps] || '';
        let valueB: any = b[sortColumn as keyof CompanyCardProps] || '';

        if (sortColumn === 'office_locations') {
          const locationA = (a.office_locations?.[0] || 'Unknown');
          const locationB = (b.office_locations?.[0] || 'Unknown');
          valueA = locationA;
          valueB = locationB;
        } else if (sortColumn === 'estimated_revenue') {
          valueA = categorizeRevenue(a.estimated_revenue || a.revenue || 'Unknown');
          valueB = categorizeRevenue(b.estimated_revenue || b.revenue || 'Unknown');
        } else if (sortColumn === 'Industries') {
          valueA = (a.Industries || a.industry || ['General']).toString();
          valueB = (b.Industries || b.industry || ['General']).toString();
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      });
  }, [companies, filters, searchTerm, sortColumn, sortDirection, categorizeRevenue]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelect = (companyName: string) => {
    const newSelection = selectedCompanies.includes(companyName)
      ? selectedCompanies.filter(name => name !== companyName)
      : [...selectedCompanies, companyName];
    onSelectCompanies(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      onSelectCompanies([]);
    } else {
      onSelectCompanies(filteredCompanies.map(c => c.name));
    }
  };

  const SortableHeader = ({ column, title }: { column: string; title: string }) => (
    <TableHead onClick={() => handleSort(column)} className="cursor-pointer hover:bg-muted">
      <div className="flex items-center gap-1">
        {title}
        <span className="ml-1 text-gray-400">{sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search companies by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Selection Table */}
      {filteredCompanies.length > 0 ? (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>
                  <div
                    onClick={handleSelectAll}
                    className="p-0"
                  >
                    {selectedCompanies.length === filteredCompanies.length ? (
                      <CheckSquare size={22} className="text-purple-500" />
                    ) : (
                      <Square size={22} className="text-gray-400" />
                    )}
                  </div>
                </TableHead>
                <SortableHeader column="name" title="Company Name" />
                <SortableHeader column="office_locations" title="Office Locations" />
                <SortableHeader column="estimated_revenue" title="Estimated Revenue" />
                <SortableHeader column="Industries" title="Industry Type" />
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map(company => (
                <TableRow
                  key={company.name}
                  className={`hover:bg-gray-50 ${selectedCompanies.includes(company.name) ? 'bg-purple-50' : ''}`}
                >
                  <TableCell>
                    <div
                      onClick={() => handleSelect(company.name)}
                      className="p-0"
                    >
                      {selectedCompanies.includes(company.name) ? (
                        <CheckSquare size={22} className="text-purple-500" />
                      ) : (
                        <Square size={22} className="text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{company.name}</TableCell>
                  <TableCell>
                    {(company.office_locations?.length ?? 0) > 0 ? company.office_locations?.join(', ') : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {categorizeRevenue(company.estimated_revenue || company.revenue || 'Unknown')}
                  </TableCell>
                  <TableCell>
                    {(company.Industries || company.industry || ['General'])
                      .toString()
                      .split(',')
                      .join(', ')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        company.status === 'shortlisted'
                          ? 'bg-green-100 text-green-800'
                          : company.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {company.status || 'pending'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700">No matching companies found</h3>
          <p className="text-gray-500 mt-2">Adjust your filters or search term</p>
        </div>
      )}

      {/* Selection Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Selected: {selectedCompanies.length}/{companies.length} companies
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onSelectCompanies(filteredCompanies.map(c => c.name))}
            disabled={filteredCompanies.length === 0}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            onClick={() => onSelectCompanies([])}
            disabled={selectedCompanies.length === 0}
          >
            Deselect All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySelection;