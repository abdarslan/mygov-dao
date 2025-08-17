import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useProjectManagement, useProjectPaymentEligibility } from "@/hooks/useProjects";

interface ProjectManagementButtonsProps {
  projectId: number;
  projectOwner: string;
  voteDeadline: Date;
  paySchedule: Date[];
  yesVotes: number;
  noVotes: number;
  beingFunded: boolean;
  onSuccess?: () => void;
}

export function ProjectManagementButtons({
  projectId,
  projectOwner,
  voteDeadline,
  paySchedule,
  yesVotes,
  noVotes,
  beingFunded,
  onSuccess,
}: ProjectManagementButtonsProps) {
  const { address: connectedAccount } = useAccount();
  const { reserveProjectGrant, withdrawProjectPayment, isProcessing, isSuccess, error } = useProjectManagement();
  const { isEligible: isEligibleForPayment } = useProjectPaymentEligibility(projectId);

  // Check if connected account is the project owner
  const isProjectOwner = connectedAccount?.toLowerCase() === projectOwner.toLowerCase();

  // Calculate voting results
  const votingPassed = yesVotes > noVotes; // Simple majority

  // Check timing conditions
  const now = new Date();
  const isVotingEnded = now > voteDeadline;
  const firstPaymentDate = paySchedule.length > 0 ? paySchedule[0] : null;
  const isBeforeFirstPayment = firstPaymentDate ? now < firstPaymentDate : true;

  // Find current payment milestone
  const currentPaymentIndex = useMemo(() => {
    if (!paySchedule.length) return -1;
    
    for (let i = 0; i < paySchedule.length; i++) {
      if (now >= paySchedule[i]) {
        // Check if this is the next payment that's due
        return i;
      }
    }
    return -1;
  }, [paySchedule, now]);

  const currentPaymentDate = currentPaymentIndex >= 0 ? paySchedule[currentPaymentIndex] : null;
  const isPaymentTime = currentPaymentDate && now >= currentPaymentDate;

  // Reserve button conditions
  const canReserve = isProjectOwner && 
                     isVotingEnded && 
                     votingPassed && 
                     !beingFunded && 
                     isBeforeFirstPayment;

  // Withdraw button conditions  
  const canWithdraw = isProjectOwner && 
                      beingFunded && 
                      isPaymentTime && 
                      isEligibleForPayment;

  const handleReserve = () => {
    reserveProjectGrant(projectId);
  };

  const handleWithdraw = () => {
    withdrawProjectPayment(projectId);
  };

  // Handle success callback
  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  // Don't show anything if user is not the project owner
  if (!isProjectOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Project Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Status Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Voting Status</p>
            <p className={`text-sm ${votingPassed ? 'text-green-600' : 'text-red-600'}`}>
              {isVotingEnded ? (votingPassed ? 'Passed' : 'Failed') : 'In Progress'}
            </p>
          </div>
          <div>
            <p className="font-medium">Funding Status</p>
            <p className={`text-sm ${beingFunded ? 'text-blue-600' : 'text-gray-600'}`}>
              {beingFunded ? 'Reserved' : 'Not Reserved'}
            </p>
          </div>
        </div>

        {/* Reserve Button */}
        {!beingFunded && (
          <div className="space-y-2">
            <Button
              variant={canReserve ? "default" : "ghost"}
              className="w-full"
              onClick={handleReserve}
              disabled={!canReserve || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Reserving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Reserve Project Grant
                </>
              )}
            </Button>
            
            {/* Reserve button status messages */}
            {!canReserve && (
              <div className="text-xs text-muted-foreground">
                {!isVotingEnded && "Waiting for voting deadline to pass"}
                {isVotingEnded && !votingPassed && "Voting did not pass"}
                {isVotingEnded && votingPassed && !isBeforeFirstPayment && "Reservation deadline has passed"}
              </div>
            )}
          </div>
        )}

        {/* Withdraw Button */}
        {beingFunded && (
          <div className="space-y-2">
            <Button
              variant={canWithdraw ? "default" : "ghost"}
              className="w-full"
              onClick={handleWithdraw}
              disabled={!canWithdraw || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Withdraw Payment
                </>
              )}
            </Button>

            {/* Withdraw button status messages */}
            {!canWithdraw && (
              <div className="text-xs text-muted-foreground">
                {!isPaymentTime && currentPaymentDate && 
                  `Next payment available on ${currentPaymentDate.toLocaleDateString()}`}
                {!isPaymentTime && !currentPaymentDate && "No payments currently due"}
                {isPaymentTime && !isEligibleForPayment && "Not eligible for payment (insufficient votes)"}
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-900">Transaction successful!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-900">
                Error: {error.message || "Transaction failed"}
              </span>
            </div>
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 border-t pt-2 space-y-1">
            <div>Payment Index: {currentPaymentIndex}</div>
            <div>Is Payment Time: {isPaymentTime ? 'Yes' : 'No'}</div>
            <div>Is Eligible: {isEligibleForPayment ? 'Yes' : 'No'}</div>
            <div>Next Payment: {currentPaymentDate?.toLocaleDateString() || 'None'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
