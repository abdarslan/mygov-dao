import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export type DonationStep = "approval" | "donation";
export type StepStatus = "pending" | "confirming" | "success" | "error" | "idle";

interface DonationTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: DonationStep;
  approvalStatus: StepStatus;
  donationStatus: StepStatus;
  tokenSymbol: string;
  amount: string;
  errorMessage?: string;
  successMessage?: string;
  approvalTxHash?: string;
  donationTxHash?: string;
}

const getStepIcon = (status: StepStatus) => {
  switch (status) {
    case "pending":
    case "confirming":
      return Loader2;
    case "success":
      return CheckCircle;
    case "error":
      return XCircle;
    default:
      return Clock;
  }
};

const getStepColor = (status: StepStatus) => {
  switch (status) {
    case "pending":
      return "text-blue-600";
    case "confirming":
      return "text-yellow-600";
    case "success":
      return "text-green-600";
    case "error":
      return "text-red-600";
    default:
      return "text-gray-400";
  }
};

export function DonationTransactionDialog({
  isOpen,
  onClose,
  currentStep,
  approvalStatus,
  donationStatus,
  tokenSymbol,
  amount,
  errorMessage,
  successMessage,
  approvalTxHash,
  donationTxHash,
}: DonationTransactionDialogProps) {
  const ApprovalIcon = getStepIcon(approvalStatus);
  const DonationIcon = getStepIcon(donationStatus);
  
  const isCompleted = donationStatus === "success";
  const hasFailed = approvalStatus === "error" || donationStatus === "error";
  const isProcessing = approvalStatus === "pending" || approvalStatus === "confirming" || 
                      donationStatus === "pending" || donationStatus === "confirming";

  const getStepDescription = (step: DonationStep, status: StepStatus) => {
    if (step === "approval") {
      switch (status) {
        case "pending":
          return "Please approve the transaction in your wallet";
        case "confirming":
          return "Approval transaction is being confirmed...";
        case "success":
          return "Token spending approved successfully";
        case "error":
          return "Approval failed";
        default:
          return "Approve token spending";
      }
    } else {
      switch (status) {
        case "pending":
          return "Please confirm the donation in your wallet";
        case "confirming":
          return "Donation transaction is being processed...";
        case "success":
          return "Donation completed successfully";
        case "error":
          return "Donation failed";
        default:
          return "Execute donation transaction";
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : hasFailed ? (
              <XCircle className="h-6 w-6 text-red-600" />
            ) : (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            )}
            Donating {amount} {tokenSymbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Approval */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <ApprovalIcon 
              className={`h-5 w-5 mt-0.5 ${getStepColor(approvalStatus)} ${
                (approvalStatus === "pending" || approvalStatus === "confirming") ? "animate-spin" : ""
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Step 1: Approve Token Spending</span>
                {approvalStatus === "success" && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✓ Complete
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {getStepDescription("approval", approvalStatus)}
              </p>
              {approvalTxHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${approvalTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  View approval transaction →
                </a>
              )}
            </div>
          </div>

          {/* Step 2: Donation */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <DonationIcon 
              className={`h-5 w-5 mt-0.5 ${getStepColor(donationStatus)} ${
                (donationStatus === "pending" || donationStatus === "confirming") ? "animate-spin" : ""
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Step 2: Execute Donation</span>
                {donationStatus === "success" && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✓ Complete
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {getStepDescription("donation", donationStatus)}
              </p>
              {donationTxHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${donationTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  View donation transaction →
                </a>
              )}
            </div>
          </div>

          {/* Success Message */}
          {isCompleted && successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {hasFailed && errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          {isCompleted || hasFailed ? (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          ) : isProcessing ? (
            <Button variant="outline" onClick={onClose} className="w-full">
              Close (Transactions will continue)
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
