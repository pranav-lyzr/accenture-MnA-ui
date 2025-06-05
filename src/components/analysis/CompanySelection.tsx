import { useState, useMemo } from 'react';
import { Search, CheckSquare, Square, Filter, Users } from 'lucide-react';
import { Button } from '../botton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui/table';

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
  office_locations: string[];
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
          filters.office_locations.length === 0 ||
          filters.office_locations.some(selectedLocation =>
            locations.includes(selectedLocation)
          );

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
    <TableHead 
      onClick={() => handleSort(column)} 
      className="cursor-pointer hover:bg-gray-50 transition-colors select-none"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">{title}</span>
        <span className="text-gray-400 text-xs">
          {sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search companies by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <Users className="h-4 w-4" />
            <span>{filteredCompanies.length} companies found</span>
          </div>
          <Button
            variant="outline"
            onClick={() => onSelectCompanies(filteredCompanies.map(c => c.name))}
            disabled={filteredCompanies.length === 0}
            className="text-sm"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            onClick={() => onSelectCompanies([])}
            disabled={selectedCompanies.length === 0}
            className="text-sm"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-4 border border-purple-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Selection Summary</p>
              <p className="text-purple-700">
                {selectedCompanies.length} of {companies.length} companies selected for analysis
              </p>
            </div>
          </div>
          {selectedCompanies.length > 0 && (
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {selectedCompanies.length} selected
            </div>
          )}
        </div>
      </div>

      {/* Companies Table */}
      {filteredCompanies.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 hover:bg-gray-50">
                  <TableHead className="w-12">
                    <button
                      onClick={handleSelectAll}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {selectedCompanies.length === filteredCompanies.length ? (
                        <CheckSquare size={20} className="text-purple-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                  </TableHead>
                  <SortableHeader column="name" title="Company Name" />
                  <SortableHeader column="office_locations" title="Locations" />
                  <SortableHeader column="estimated_revenue" title="Revenue Range" />
                  <SortableHeader column="Industries" title="Industry" />
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company, index) => (
                  <TableRow
                    key={company.name}
                    className={`transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                      selectedCompanies.includes(company.name) 
                        ? 'bg-purple-50 border-l-4 border-l-purple-500' 
                        : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                    onClick={() => handleSelect(company.name)}
                  >
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(company.name);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {selectedCompanies.includes(company.name) ? (
                          <CheckSquare size={20} className="text-purple-600" />
                        ) : (
                          <Square size={20} className="text-gray-400" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-900">{company.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">
                        {(company.office_locations?.length ?? 0) > 0 
                          ? company.office_locations?.slice(0, 2).join(', ') + 
                            (company.office_locations!.length > 2 ? ` +${company.office_locations!.length - 2}` : '')
                          : 'Unknown'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categorizeRevenue(company.estimated_revenue || company.revenue || 'Unknown')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">
                        {(company.Industries || company.industry || ['General'])
                          .toString()
                          .split(',')
                          .slice(0, 2)
                          .join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.status === 'shortlisted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : company.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
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
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Matching Companies</h3>
          <p className="text-gray-500">Adjust your filters or search term to find companies</p>
        </div>
      )}
    </div>
  );
};

export default CompanySelection;
