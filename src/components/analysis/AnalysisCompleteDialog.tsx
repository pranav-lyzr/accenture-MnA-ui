import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../botton';

interface AnalysisCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAnalyzing: boolean;
}

const AnalysisCompleteDialog = ({ open, onOpenChange, isAnalyzing }: AnalysisCompleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {isAnalyzing ? 'Processing Analysis' : 'Analysis Complete'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-purple-500 border-opacity-25 border-t-purple-500"></div>
              <p className="text-gray-600">Analyzing companies, please wait...</p>
            </div>
          ) : (
            <p className="text-gray-600">
              The analysis has been successfully completed. You can now view the rankings, summary, and recommendations below.
            </p>
          )}
        </div>
        {!isAnalyzing && (
          <div className="flex justify-end">
            <Button
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisCompleteDialog;