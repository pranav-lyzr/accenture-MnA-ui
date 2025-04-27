import { X } from 'lucide-react';
import { EnrichedCompanyData } from '../../services/api';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyData: EnrichedCompanyData | null;
  loading: boolean;
  error: string | null;
}

const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, companyData, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-00 bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{companyData?.name || 'Company Details'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-opacity-25 border-t-purple-500"></div>
            <p className="mt-2 text-gray-500">Loading company details...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {companyData && !loading && !error && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Overview</h3>
              <p className="text-gray-600">{companyData.short_description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Details</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Website: <a href={companyData.website_url} target="_blank" className="text-blue-500 hover:underline">{companyData.website_url}</a></li>
                <li>Industry: {companyData.industry}</li>
                <li>Founded: {companyData.founded_year}</li>
                <li>Employees: {companyData.estimated_num_employees}</li>
                <li>Revenue: ${companyData.annual_revenue?.toLocaleString()}</li>
                <li>Location: {companyData.raw_address}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {companyData.current_technologies.slice(0, 5).map(tech => (
                  <span key={tech.uid} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {companyData.keywords.slice(0, 5).map(keyword => (
                  <span key={keyword} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;