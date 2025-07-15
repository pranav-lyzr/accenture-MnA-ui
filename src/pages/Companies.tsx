import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Search, ArrowUpDown, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/botton';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
} from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import api from '../services/api';
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import LoadingPopup from '../components/ui/LoadingPopup';

// Interface aligned with the /company API response
interface CompanyCardProps {
  _id: string;
  name: string;
  "Broad Category": string;
  Industries: string;
  Ownership: string;
  Services: string;
  domain_name: string;
  employee_count: string;
  estimated_revenue: string;
  key_clients: string[];
  leadership: { name: string; title: string }[];
  merger_synergies: string;
  office_locations: string[];
  revenue_growth: string;
  sources: string[];
  validation_warnings: string[];
}

const Companies = () => {
  const [loading, setLoading] = useState(true);
  const [redoingSearch, setRedoingSearch] = useState(false);
  const [companies, setCompanies] = useState<CompanyCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('name'); // Default sort by name
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Fetch companies directly from the /company API on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const companiesData = await api.getCompanies();
        setCompanies(companiesData as CompanyCardProps[]);
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  // Handle redo search by triggering api.redoSearch and refreshing company data
  const handleRedoAllSearch = async () => {
    try {
      setRedoingSearch(true);
      await api.redoSearch(); // Trigger backend search update
      const updatedCompanies = await api.getCompanies(); // Fetch updated data
      setCompanies(updatedCompanies as CompanyCardProps[]);
    } catch (error) {
      console.error('Error redoing search:', error);
    } finally {
      setRedoingSearch(false);
    }
  };

  // Sort table columns
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Open company details page
  const openCompanyDetails = (company: CompanyCardProps) => {
    navigate(`/company/${company._id}`);
  };

  // Generate and download Excel file using API data
  const handleDownloadExcel = () => {
    const excelData = filteredCompanies.map(company => ({
      Company: company.name || '-',
      Domain: company.domain_name || '-',
      'Estimated Revenue': company.estimated_revenue || '-',
      'Employee Count': company.employee_count || '-',
      Industries: company.Industries || '-',
      Services: company.Services || '-',
      Ownership: company.Ownership || '-',
      'Key Clients': Array.isArray(company.key_clients) ? company.key_clients.join(', ') : '-',
      Leadership: Array.isArray(company.leadership) ? company.leadership.map(l => `${l.name} (${l.title})`).join(', ') : '-',
      'Merger Synergies': company.merger_synergies || '-',
      'Office Locations': Array.isArray(company.office_locations) ? company.office_locations.join(', ') : '-',
      'Revenue Growth': company.revenue_growth || '-',
      Sources: Array.isArray(company.sources) ? company.sources.join(', ') : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 30 }, // Company
      { wch: 20 }, // Domain
      { wch: 20 }, // Estimated Revenue
      { wch: 15 }, // Employee Count
      { wch: 30 }, // Industries
      { wch: 30 }, // Services
      { wch: 15 }, // Ownership
      { wch: 30 }, // Key Clients
      { wch: 40 }, // Leadership
      { wch: 40 }, // Merger Synergies
      { wch: 30 }, // Office Locations
      { wch: 20 }, // Revenue Growth
      { wch: 50 }, // Sources
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');
    XLSX.writeFile(workbook, 'Companies.xlsx');
  };

  // Sort companies based on selected column and direction
  const sortedCompanies = [...companies].sort((a, b) => {
    let valueA = (a as any)[sortColumn];
    let valueB = (b as any)[sortColumn];
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    valueA = valueA || 0;
    valueB = valueB || 0;
    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  });

  // Filter companies based on search term using available fields
  const filteredCompanies = searchTerm
    ? sortedCompanies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.Industries && company.Industries.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.Services && company.Services.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.merger_synergies && company.merger_synergies.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : sortedCompanies;

  // Pagination calculations
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Render sortable table header
  const SortableHeader = ({ column, title, className = "" }: { column: string, title: string, className?: string }) => (
    <TableHead onClick={() => handleSort(column)} className={`cursor-pointer hover:bg-muted ${className}`}>
      <div className="flex items-center gap-1">
        {title}
        <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        {sortColumn === column && (
          <span className="ml-1 text-purple-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  );

  // Render table content
  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-opacity-25 border-t-purple-500"></div>
          <p className="mt-2 text-gray-500">Loading companies...</p>
        </div>
      );
    } else if (companies.length === 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700">No companies found</h3>
          <p className="text-gray-500 mt-2">No company data available</p>
        </div>
      );
    } else if (filteredCompanies.length === 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Search size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No matching companies found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          {/* Table with fixed columns */}
          <div className="relative rounded-lg border border-gray-200 bg-card overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <Table className="relative">
                {/* Fixed header */}
                <TableHeader className="sticky top-0 z-20 bg-gray-50">
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    {/* Fixed first column */}
                    <SortableHeader 
                      column="name" 
                      title="Company" 
                      className="sticky left-0 z-30 bg-gray-50 border-r border-gray-200 min-w-[200px]"
                    />
                    <TableHead className="min-w-[150px]">Domain</TableHead>
                    <TableHead className="min-w-[150px]">Estimated Revenue</TableHead>
                    <TableHead className="min-w-[130px]">Employee Count</TableHead>
                    <TableHead className="min-w-[200px]">Industries</TableHead>
                    <TableHead className="min-w-[200px]">Services</TableHead>
                    <TableHead className="min-w-[120px]">Ownership</TableHead>
                    <TableHead className="min-w-[200px]">Key Clients</TableHead>
                    <TableHead className="min-w-[250px]">Leadership</TableHead>
                    <TableHead className="min-w-[250px]">Merger Synergies</TableHead>
                    <TableHead className="min-w-[200px]">Office Locations</TableHead>
                    <TableHead className="min-w-[150px]">Revenue Growth</TableHead>
                    <TableHead className="min-w-[150px]">Sources</TableHead>
                    {/* Fixed last column */}
                    <TableHead className="sticky right-0 z-30 bg-gray-50 border-l border-gray-200 min-w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCompanies.map((company) => (
                    <TableRow key={company._id} className="hover:bg-gray-50/70">
                      {/* Fixed first column */}
                      <TableCell className="sticky left-0 z-10 bg-white border-r border-gray-200 font-semibold text-purple-500 min-w-[200px]">
                        {company.name}
                        {company.domain_name && (
                          <div className="text-xs text-blue-500 mt-1">
                            <a 
                              href={`https://${company.domain_name}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:underline"
                            >
                              {company.domain_name}
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[150px]">{company.domain_name || '-'}</TableCell>
                      <TableCell className="min-w-[150px]">{company.estimated_revenue || '-'}</TableCell>
                      <TableCell className="min-w-[130px]">{company.employee_count || '-'}</TableCell>
                      <TableCell className="min-w-[200px]">{company.Industries || '-'}</TableCell>
                      <TableCell className="min-w-[200px]">{company.Services || '-'}</TableCell>
                      <TableCell className="min-w-[120px]">{company.Ownership || '-'}</TableCell>
                      <TableCell className="min-w-[200px]">
                        {Array.isArray(company.key_clients) ? company.key_clients.join(', ') : '-'}
                      </TableCell>
                      <TableCell className="min-w-[250px]">
                        {Array.isArray(company.leadership) 
                          ? company.leadership.map(l => `${l.name} (${l.title})`).join(', ') 
                          : '-'}
                      </TableCell>
                      <TableCell className="min-w-[250px]">{company.merger_synergies || '-'}</TableCell>
                      <TableCell className="min-w-[200px]">
                        {Array.isArray(company.office_locations) ? company.office_locations.join(', ') : '-'}
                      </TableCell>
                      <TableCell className="min-w-[150px]">{company.revenue_growth || '-'}</TableCell>
                      <TableCell className="min-w-[150px]">
                        {Array.isArray(company.sources) && company.sources.length > 0 ? (
                          <div className="flex flex-col space-y-1">
                            {company.sources.map((source, idx) => {
                              let hostname;
                              try {
                                hostname = new URL(source).hostname;
                              } catch (e) {
                                hostname = source;
                              }
                              return (
                                <a 
                                  key={idx} 
                                  href={source} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-500 hover:underline text-sm truncate max-w-[120px]"
                                >
                                  {hostname}
                                </a>
                              );
                            })}
                          </div>
                        ) : '-'}
                      </TableCell>
                      {/* Fixed last column */}
                      <TableCell className="sticky right-0 z-10 bg-white border-l border-gray-200 min-w-[125px]">
                        <Button 
                          onClick={() => openCompanyDetails(company)}
                          size="sm"
                          className="text-blue-600 text-xs px-2 py-1"
                          variant='secondary'
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length} results
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">Rows per page:</p>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={i}
                        variant={pageNumber === currentPage ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className='p-6'>
        <LoadingPopup
          isOpen={loading || redoingSearch}
          message={loading ? "Loading Companies" : "Redoing All Searches"}
        />
        
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
            <p className="text-gray-500">
              Browse and filter identified merger candidates ({companies.length} identified)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleDownloadExcel}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download as Excel
            </Button>
            <Button 
              onClick={handleRedoAllSearch}
              disabled={redoingSearch}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={redoingSearch ? "animate-spin" : ""} />
              Redo All Searches
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by company name, industries, services, or synergies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {renderTableContent()}
      </div>
      
    </Layout>
  );
};

export default Companies;