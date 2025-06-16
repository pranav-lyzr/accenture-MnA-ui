import { useState } from "react";
import DetailDialog from "../../components/ui/DetailDialog";
import { Button } from "../../components/botton";
import { Loader2, Database, Search } from "lucide-react";
import api from "../../services/api";

interface CompanyDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Record<string, any> | null;
}

const CompanyDetailsDialog = ({
  open,
  onOpenChange,
  company,
}: CompanyDetailsProps) => {
  const [loadingApollo, setLoadingApollo] = useState(false);
  const [loadingPerplexity, setLoadingPerplexity] = useState(false);
  const [enrichedData, setEnrichedData] = useState<Record<string, any> | null>(
    null
  );

  if (!company) return null;

  // Function to format field names for display
  const formatFieldName = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const fetchApolloData = async () => {
    if (!company.domain_name) {
      return;
    }

    try {
      setLoadingApollo(true);
      const result = await api.enrichCompanyApollo(company.domain_name);
      setEnrichedData((prev) => ({ ...prev, ...result.company }));
    } catch (error) {
      console.error("Error fetching Apollo data:", error);
    } finally {
      setLoadingApollo(false);
    }
  };

  const fetchPerplexityData = async () => {
    if (!company.name || !company.domain_name) {
      return;
    }

    try {
      setLoadingPerplexity(true);
      const result = await api.companyResearch(
        company.name,
        company.domain_name
      );

      console.log("result research", result);

      setEnrichedData((prev) => ({ ...prev, ...result.company }));

      if (result.validation_warnings && result.validation_warnings.length > 0) {
        const d = 2;
      } else {
        const s = 2;
      }
    } catch (error) {
      console.error("Error fetching Perplexity data:", error);
    } finally {
      setLoadingPerplexity(false);
    }
  };

  // Combine company data with enriched data if available
  const displayData = enrichedData ? { ...company, ...enrichedData } : company;

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={displayData.name}
      subtitle={
        displayData.domain_name && (
          <a
            href={`https://${displayData.domain_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {displayData.domain_name}
          </a>
        )
      }
    >
      <div className="flex gap-3 mb-4">
        <Button
          variant="outline"
          onClick={fetchApolloData}
          disabled={loadingApollo || !company.domain_name}
          className="flex items-center space-x-2"
        >
          {loadingApollo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          <span>Fetch Apollo Data</span>
        </Button>

        <Button
          variant="outline"
          onClick={fetchPerplexityData}
          disabled={loadingPerplexity || !company.domain_name || !company.name}
          className="flex items-center space-x-2 cursor-pointer"
        >
          {loadingPerplexity ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span>Research</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {Object.entries(displayData).map(([key, value]) => {
          // Skip name and domain_name as they are already displayed in the header
          if (
            key === "name" ||
            key === "domain_name" ||
            key === "validation_warnings"
          )
            return null;

          return (
            <div key={key} className="border-b pb-2">
              <h4 className="font-medium text-gray-700">
                {formatFieldName(key)}:
              </h4>
              <div className="mt-1">
                {(() => {
                  if (key === "leadership" && Array.isArray(value)) {
                    return (
                      <ul className="list-disc list-inside">
                        {value.map((leader: any, i: number) => (
                          <li key={i}>
                            {leader.name} - {leader.title}
                            {leader.experience && ` (${leader.experience})`}
                          </li>
                        ))}
                      </ul>
                    );
                  } else if (key === "sources" && Array.isArray(value)) {
                    return (
                      <div className="flex flex-wrap gap-2">
                        {value.map((source: string, i: number) => {
                          let hostname;
                          try {
                            hostname = new URL(source).hostname.replace(
                              "www.",
                              ""
                            );
                          } catch (e) {
                            hostname = source;
                          }
                          return (
                            <a
                              key={i}
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {hostname}
                            </a>
                          );
                        })}
                      </div>
                    );
                  } else if (Array.isArray(value)) {
                    return value.join(", ") || "N/A";
                  } else if (value === undefined || value === null) {
                    return "N/A";
                  } else if (typeof value === "object") {
                    return JSON.stringify(value, null, 2);
                  } else {
                    return value.toString();
                  }
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* {displayData.validation_warnings && displayData.validation_warnings.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">Validation Warnings:</h4>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {displayData.validation_warnings.map((warning: string, i: number) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )} */}
    </DetailDialog>
  );
};

export default CompanyDetailsDialog;
