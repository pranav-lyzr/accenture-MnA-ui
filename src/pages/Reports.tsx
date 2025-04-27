import Layout from '../components/layout/Layout';
import { FileText, Download, ArrowRight, File } from 'lucide-react';
import { Button } from '../components/botton';
import { useToast } from "../hooks/use-toast";
import api from '../services/api';

const reportTypes = [
  {
    title: 'Companies Report',
    description: 'List of all identified companies with basic information',
    format: 'CSV',
    icon: <File size={32} className="text-purple-500" />,
    handler: 'downloadCSV'
  },
  {
    title: 'Full Analysis Report',
    description: 'Complete merger candidate analysis with rankings and justifications',
    format: 'JSON',
    icon: <FileText size={32} className="text-purple-500" />,
    handler: 'downloadJSON'
  }
];

const Reports = () => {
  const { toast } = useToast();
  
  const handleDownload = (handler: string) => {
    if (handler === 'downloadCSV') {
      api.downloadCSV();
    } else if (handler === 'downloadJSON') {
      api.downloadJSON();
    }
    
    toast({
      title: "Download Started",
      description: "Your report is being downloaded",
    });
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-500">Download and export analysis reports</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
            <div className="p-6">
              <div className="flex items-start">
                {report.icon}
                <div className="ml-4">
                  <h3 className="text-lg font-bold">{report.title}</h3>
                  <p className="text-gray-500 mt-1">{report.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Format: {report.format}</span>
                    <Button
                      onClick={() => handleDownload(report.handler)}
                      className="bg-purple-500 hover:bg-purple-200 flex items-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Custom Reports</h2>
        <div className="bg-gray-100 rounded-xl p-6">
          <p className="text-gray-700">
            Need a custom report format? Configure and export data in your preferred structure.
          </p>
          <Button 
            className="mt-4 flex items-center space-x-2"
            variant="outline"
          >
            <span>Configure Custom Report</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
