import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export type TransactionStatus = "idle" | "pending" | "confirming" | "success" | "error";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: TransactionStatus;
  title: string;
  description?: string;
  errorMessage?: string;
  successMessage?: string;
  txHash?: string;
}

const statusConfig = {
  idle: {
    icon: null,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    title: "Ready to proceed",
    description: undefined,
  },
  pending: {
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "Transaction Pending",
    description: "Please confirm the transaction in your wallet...",
  },
  confirming: {
    icon: Loader2,
    color: "text-yellow-600", 
    bgColor: "bg-yellow-50",
    title: "Confirming Transaction",
    description: "Transaction submitted, waiting for confirmation...",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    title: "Transaction Successful",
    description: undefined,
  },
  error: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    title: "Transaction Failed",
    description: undefined,
  },
} as const;

export function TransactionDialog({
  isOpen,
  onClose,
  status,
  title,
  description,
  errorMessage,
  successMessage,
  txHash,
}: TransactionDialogProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {Icon && (
              <Icon 
                className={`h-6 w-6 ${config.color} ${
                  status === "pending" || status === "confirming" ? "animate-spin" : ""
                }`} 
              />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className={`p-4 rounded-lg ${config.bgColor} ${config.color}`}>
          <div className="space-y-3">
            {/* Status Description */}
            <div>
              <h4 className="font-medium">{config.title}</h4>
              {config.description && (
                <p className="text-sm opacity-80 mt-1">{config.description}</p>
              )}
              {description && (
                <p className="text-sm opacity-80 mt-1">{description}</p>
              )}
            </div>

            {/* Success Message */}
            {status === "success" && successMessage && (
              <div className="p-2 bg-green-100 border border-green-200 rounded text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {status === "error" && errorMessage && (
              <div className="p-2 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
                {errorMessage}
              </div>
            )}

            {/* Transaction Hash */}
            {txHash && (
              <div className="space-y-2">
                <p className="text-xs font-medium">Transaction Hash:</p>
                <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                  {txHash}
                </code>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View on Etherscan →
                </a>
              </div>
            )}

            {/* Progress Indicators */}
            {(status === "pending" || status === "confirming") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === "pending" ? "bg-blue-500 animate-pulse" : "bg-green-500"
                  }`} />
                  <span className="text-xs">Transaction submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === "confirming" ? "bg-yellow-500 animate-pulse" : "bg-gray-300"
                  }`} />
                  <span className="text-xs">Waiting for confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-xs">Transaction confirmed</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          {status === "success" || status === "error" ? (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          ) : status === "pending" || status === "confirming" ? (
            <Button variant="outline" onClick={onClose} className="w-full">
              Close (Transaction will continue)
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
