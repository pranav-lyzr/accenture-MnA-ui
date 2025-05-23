import { Play, Loader2, FileText } from 'lucide-react';
import LyzrLogo from '../../assets/main logo.png';

interface PromptCardProps {
  index: number;
  title: string;
  isRunning?: boolean;
  onRun: (index: number) => void;
  hasResults?: boolean;
  agentId?: string; // Add agentId prop
}

const PromptCard = ({
  index,
  title,
  isRunning = false,
  onRun,
  hasResults = false,
  agentId, // Destructure agentId
}: PromptCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            {hasResults && (
              <div className="p-1 bg-green-50 text-green-600 rounded-md">
                <FileText size={18} />
              </div>
            )}
            {agentId && (
              <a
                href={`https://studio.lyzr.ai/agent-create/${agentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 w-8 hover:bg-gray-100 rounded-md"
                title="View in Lyzr Studio"
              >
                <img
                  src={LyzrLogo}
                  alt="Lyzr Logo"
                  className="h-5 w-5 object-contain"
                />
              </a>
            )}
            <button
              onClick={() => onRun(index)}
              disabled={isRunning}
              className={`p-2 rounded-md ${
                isRunning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-200'
              }`}
            >
              {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Search Agent #{index + 1} - {hasResults ? 'Results available' : 'Not yet executed'}
        </p>
      </div>
    </div>
  );
};

export default PromptCard;