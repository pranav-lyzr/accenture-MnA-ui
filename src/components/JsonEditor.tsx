import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, className = "" }) => {
  const [jsonString, setJsonString] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setJsonString(JSON.stringify(value, null, 2));
      setIsValid(true);
      setError('');
    } catch (err) {
      setError('Invalid JSON structure');
      setIsValid(false);
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setJsonString(newValue);
    
    try {
      const parsed = JSON.parse(newValue);
      onChange(parsed);
      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError('Invalid JSON syntax');
    }
  };

  const formatFieldName = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">empty array</span>;
      }
      
      if (typeof value[0] === "object" && value[0] !== null) {
        return (
          <div className="space-y-2">
            {value.map((item, idx) => (
              <Card key={idx} className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
                <CardContent className="p-3">
                  <div className="space-y-1">
                    {Object.entries(item).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-start gap-2">
                        <span className="text-xs font-medium text-slate-600 min-w-0">
                          {formatFieldName(k)}:
                        </span>
                        <span className="text-xs text-slate-900 font-medium text-right min-w-0">
                          {typeof v === "object" && v !== null ? (
                            <div className="space-y-1">
                              {Object.entries(v).map(([subK, subV]) => (
                                <div key={subK} className="text-xs">
                                  <span className="font-medium">{formatFieldName(subK)}: </span>
                                  <span>{subV?.toString() || "N/A"}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            v?.toString() || "N/A"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof value === "object" && value !== null) {
      return (
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardContent className="p-3">
            <div className="space-y-1">
              {Object.entries(value).map(([k, v]) => (
                <div key={k} className="flex justify-between items-start gap-2">
                  <span className="text-xs font-medium text-slate-600 min-w-0">
                    {formatFieldName(k)}:
                  </span>
                  <span className="text-xs text-slate-900 font-medium text-right min-w-0">
                    {typeof v === "object" && v !== null ? JSON.stringify(v) : v?.toString() || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return <span className="text-slate-900 font-medium">{value.toString()}</span>;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-indigo-900">Editor</h4>
          <div className="flex items-center gap-2">
            {isValid ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Valid JSON</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-xs text-red-600 font-medium">Invalid JSON</span>
              </div>
            )}
          </div>
        </div>
        
        <textarea
          className={`w-full font-mono text-sm bg-white border-2 rounded-lg px-3 py-2 transition-colors resize-none ${
            isValid 
              ? 'border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100' 
              : 'border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100'
          }`}
          rows={Math.min(Math.max(jsonString.split('\n').length, 4), 12)}
          value={jsonString}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter valid JSON..."
        />
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>
      
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Preview</h4>
        <div className="max-h-60 overflow-y-auto">
          {isValid ? renderValue(value) : (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Fix JSON syntax to see preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonEditor;