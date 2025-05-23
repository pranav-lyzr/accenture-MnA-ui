import { useState, useEffect } from 'react';
import { Button } from '../../components/botton';

interface CompanyCardProps {
  name: string;
  office_locations?: string[];
  estimated_revenue?: string;
  revenue?: string;
  Industries?: string | string[];
  industry?: string | string[];
}

interface Filters {
  office_locations: string[];
  revenue: string;
  industry: string;
}

interface CompanyFiltersProps {
  companies: CompanyCardProps[];
  onFilterChange: (filters: Filters) => void;
  categorizeRevenue: (revenue: string) => string;
}

const CompanyFilters = ({ companies, onFilterChange }: CompanyFiltersProps) => {
  const [filters, setFilters] = useState<Filters>({
    office_locations: [],
    revenue: 'All',
    industry: 'All',
  });

  // Extract unique filter options
  const allLocationOptions = [
    ...new Set(
      companies
        .flatMap(c => c.office_locations || ['Unknown'])
        .filter(location => location)
    ),
  ].sort();

  const locationOptions = allLocationOptions.filter(
    location => !filters.office_locations.includes(location)
  );

  const revenueOptions = ['All', 'Under $5M', '$5M - $10M', '$10M - $20M', '$20M - $50M', 'Over $50M'];
  const industryOptions = [
    'All',
    ...new Set(
      companies.flatMap(c => {
        const industries = c.Industries || c.industry || ['General'];
        return Array.isArray(industries) ? industries : [industries];
      })
    ),
  ];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof Filters, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocation = e.target.value;
    if (selectedLocation && !filters.office_locations.includes(selectedLocation)) {
      const newLocations = [...filters.office_locations, selectedLocation];
      handleFilterChange('office_locations', newLocations);
    }
    e.target.value = '';
  };

  const removeLocation = (location: string) => {
    const newLocations = filters.office_locations.filter(loc => loc !== location);
    handleFilterChange('office_locations', newLocations);
  };

  const clearFilters = () => {
    setFilters({ office_locations: [], revenue: 'All', industry: 'All' });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Office Locations
        </label>
        <select
          id="location-filter"
          onChange={handleLocationChange}
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          defaultValue=""
        >
          <option value="" disabled>
            Select a location
          </option>
          {locationOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.office_locations.length > 0 ? (
            filters.office_locations.map(location => (
              <span
                key={location}
                className="inline-flex items-center bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {location}
                <button
                  onClick={() => removeLocation(location)}
                  className="ml-2 focus:outline-none"
                  aria-label={`Remove ${location}`}
                >
                  ✕
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No locations selected.</span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="revenue-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Revenue Range
        </label>
        <select
          id="revenue-filter"
          value={filters.revenue}
          onChange={(e) => handleFilterChange('revenue', e.target.value)}
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {revenueOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="industry-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Industry Type
        </label>
        <select
          id="industry-filter"
          value={filters.industry}
          onChange={(e) => handleFilterChange('industry', e.target.value)}
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {industryOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="text-gray-600 border-gray-300 hover:bg-gray-100 mb-7"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default CompanyFilters;