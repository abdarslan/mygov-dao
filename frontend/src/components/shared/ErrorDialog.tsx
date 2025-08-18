import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, Info } from "lucide-react";

export type ErrorSeverity = "error" | "warning" | "info";

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  severity?: ErrorSeverity;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const severityConfig = {
  error: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    buttonColor: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
};

export function ErrorDialog({
  isOpen,
  onClose,
  title,
  message,
  severity = "error",
  details,
  actionLabel = "OK",
  onAction,
}: ErrorDialogProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className={`p-4 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
          <p className="text-sm text-gray-800 mb-2">{message}</p>
          
          {details && (
            <div className="mt-3 p-3 bg-white/50 rounded border border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-1">Details:</p>
              <p className="text-xs text-gray-700 font-mono break-all">{details}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            className={`text-white ${config.buttonColor}`}
          >
            {actionLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
