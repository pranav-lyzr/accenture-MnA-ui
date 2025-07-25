import React from "react";
import { X } from "lucide-react";
import { Button } from "../botton";

interface DetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  companies: string[];
}

const DetailDialog: React.FC<DetailDialogProps> = ({
  isOpen,
  onClose,
  title,
  companies,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-invert backdrop-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <Button variant="outline" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {companies.map((company, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <span className="text-gray-900 font-medium">{company}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailDialog;
