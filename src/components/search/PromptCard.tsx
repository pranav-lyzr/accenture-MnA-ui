import { Play, Loader2, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface PromptCardProps {
  index: number;
  title: string;
  isRunning?: boolean;
  onRun: (index: number) => void;
  hasResults?: boolean;
  agentId?: string;
  onShowResults?: (index: number) => void; // <-- Add this
}

const PromptCard = ({
  index,
  title,
  isRunning = false,
  onRun,
  hasResults = false,
  agentId,
  onShowResults,
}: PromptCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden flex flex-col h-35">
      {/* Main Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1 truncate">
                    {title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-gray-600 line-clamp-2">
              Agent #{index + 1} • Ready to execute
            </p>
          </div>
          {/* Run Button */}
          <button
            onClick={() => onRun(index)}
            disabled={isRunning}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
              transition-all duration-200 min-w-[100px] justify-center
              ${
                isRunning
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 shadow-sm hover:shadow-md"
              }
            `}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Run Agent
              </>
            )}
          </button>
        </div>

        {/* Action Links */}
        {(hasResults || agentId) && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-auto">
            {hasResults && onShowResults && (
              <button
                type="button"
                onClick={() => onShowResults(index)}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors cursor-pointer"
              >
                Results Available
                <ExternalLink size={12} />
              </button>
            )}
            {agentId && (
              <a
                href={`https://studio.lyzr.ai/agent-create/${agentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                View in Lyzr
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptCard;
