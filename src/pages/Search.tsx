import { useState, useEffect } from 'react';
import { useToast } from "../hooks/use-toast";
import Layout from '../components/layout/Layout';
import PromptCard from '../components/search/PromptCard';
import { AlertCircle } from 'lucide-react';
import { SearchResponse } from '../types/search';
import api, { Prompt } from '../services/api';

const STORAGE_KEY = 'accenture-search-results';

// Utility function to format field names for display
const formatFieldName = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Search = () => {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningPrompts, setRunningPrompts] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<{ [key: number]: SearchResponse }>({});

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const data = await api.getPrompts();
        setPrompts(data);

        // Load saved results from localStorage
        const savedResults = localStorage.getItem(STORAGE_KEY);
        if (savedResults) {
          setResults(JSON.parse(savedResults));
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
        toast({
          title: "Error",
          description: "Failed to load search prompts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [toast]);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    }
  }, [results]);

  const handleRunPrompt = async (index: number) => {
    try {
      setRunningPrompts(prev => new Set([...prev, index]));
      const result = await api.runPrompt(index);

      setResults(prev => ({
        ...prev,
        [index]: result,
      }));

      toast({
        title: "Search Complete",
        description: `Found ${result.companies.length} companies`,
      });
    } catch (error) {
      console.error('Error running prompt:', error);
      toast({
        title: "Search Failed",
        description: "An error occurred while running the search prompt",
        variant: "destructive",
      });
    } finally {
      setRunningPrompts(prev => {
        const updated = new Set([...prev]);
        updated.delete(index);
        return updated;
      });
    }
  };

  const handleRedo = (index: number) => {
    // Remove result for this prompt
    const newResults = { ...results };
    delete newResults[index];
    setResults(newResults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newResults));

    // Run the prompt again
    handleRunPrompt(index);
  };

  // Utility function to render field values
  const renderFieldValue = (key: string, value: any): JSX.Element | null => {
    if (value == null) return null;

    // Handle arrays (e.g., office_locations, key_clients, primary_domains, technology_tools)
    if (Array.isArray(value) && key !== 'leadership' && key !== 'sources') {
      return (
        <p>
          <span className="font-medium">{formatFieldName(key)}:</span>{' '}
          {value.join(', ')}
        </p>
      );
    }

    // Handle sources array (render as links)
    if (key === 'sources' && Array.isArray(value)) {
      return (
        <p>
          <span className="font-medium">{formatFieldName(key)}:</span>{' '}
          {value.map((source, j) => (
            <a
              key={j}
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mr-2"
            >
              [Source {j + 1}]
            </a>
          ))}
        </p>
      );
    }

    // Handle leadership array (render as list of name, title, experience)
    if (key === 'leadership' && Array.isArray(value)) {
      return (
        <div>
          <span className="font-medium">{formatFieldName(key)}:</span>
          <ul className="list-disc pl-5">
            {value.map((leader, j) => (
              <li key={j}>
                {leader.name} ({leader.title}) - {leader.experience}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Handle string or number values
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <p>
          <span className="font-medium">{formatFieldName(key)}:</span> {value}
        </p>
      );
    }

    return null; // Skip other types
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Search Prompts</h1>
        <p className="text-gray-500">Execute search prompts to identify potential merger candidates</p>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
        <div className="text-blue-500 mr-3 mt-1 flex-shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-blue-800">Running Search Prompts</h3>
          <p className="text-sm text-blue-600 mt-1">
            Run individual prompts to explore specific criteria or use the complete analysis
            to generate a comprehensive merger candidate report.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-opacity-25 border-t-purple-500"></div>
          <p className="mt-2 text-gray-500">Loading search prompts...</p>
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No search prompts available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.index}
              index={prompt.index}
              title={prompt.title}
              isRunning={runningPrompts.has(prompt.index)}
              hasResults={!!results[prompt.index]}
              onRun={handleRunPrompt}
            />
          ))}
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Search Results</h2>
          {Object.entries(results).map(([index, result]) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold">{result.title}</h3>
                <button
                  onClick={() => handleRedo(Number(index))}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Redo Search
                </button>
              </div>
              <p className="text-gray-500 mb-4">Found {result.companies.length} potential candidates</p>

              {result.companies.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {result.companies.map((company, i) => (
                      <div key={i} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                        {company}
                      </div>
                    ))}
                  </div>

                  {/* Display response array */}
                  {result.response?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Detailed Company Information:</h4>
                      <div className="space-y-4">
                        {result.response.map((company, i) => (
                          <div key={i} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                            <h5 className="text-base font-semibold text-gray-800">{company.name}</h5>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {Object.entries(company).map(([key, value]) => {
                                // Skip name (already displayed)
                                if (key === 'name') return null;
                                return renderFieldValue(key, value);
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.sources && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Sources:</h4>
                      <div className="space-y-1">
                        {result.sources.map((source, i) => (
                          <a
                            key={i}
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-500 hover:underline"
                          >
                            {source}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Search;