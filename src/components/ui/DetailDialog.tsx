import React from "react";
import { X } from "lucide-react";
import { Button } from "../botton";

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}

const DetailDialog: React.FC<DetailDialogProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-invert backdrop-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={() => onOpenChange(false)}
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
