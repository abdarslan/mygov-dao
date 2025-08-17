import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectCreation } from "@/hooks/useProjects";
import { PaymentSchedule, type PaymentScheduleItem } from "@/components/shared/PaymentSchedule";
import { DateTimePicker } from "@/components/shared/DateTimePicker";

interface ProjectSubmissionModalProps {
  children: React.ReactNode;
  onProjectSubmitted?: () => void;
}

export function ProjectSubmissionModal({ children, onProjectSubmitted }: ProjectSubmissionModalProps) {
  const [open, setOpen] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const [voteDeadline, setVoteDeadline] = useState<Date | undefined>();
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>([
    { amount: "", deadline: undefined }
  ]);

  const {
    // Project submission
    submitProjectProposal,
    isSubmitting,
    isProjectSubmitted,
    projectError,

    // TLToken approval
    approveTLToken,
    isTLTokenApproving,
    isTLTokenApproved,
    tlTokenError,

    // MyGov approval
    approveMyGov,
    isMyGovApproving,
    isMyGovApproved,
    myGovError,

    // Overall state
    isLoading,
  } = useProjectCreation();

  // Track the current step
  const [currentStep, setCurrentStep] = useState<'form' | 'tltoken' | 'mygov' | 'submit'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!voteDeadline) return;
    
    // Start the approval process
    setCurrentStep('tltoken');
  };

  // Handle TLToken approval
  useEffect(() => {
    if (currentStep === 'tltoken' && !isTLTokenApproving && !isTLTokenApproved) {
      approveTLToken();
    }
  }, [currentStep, approveTLToken, isTLTokenApproving, isTLTokenApproved]);

  // Move to MyGov approval after TLToken approval
  useEffect(() => {
    if (isTLTokenApproved && currentStep === 'tltoken') {
      setCurrentStep('mygov');
    }
  }, [isTLTokenApproved, currentStep]);

  // Handle MyGov approval
  useEffect(() => {
    if (currentStep === 'mygov' && !isMyGovApproving && !isMyGovApproved) {
      approveMyGov();
    }
  }, [currentStep, approveMyGov, isMyGovApproving, isMyGovApproved]);

  // Move to project submission after MyGov approval
  useEffect(() => {
    if (isMyGovApproved && currentStep === 'mygov') {
      setCurrentStep('submit');
    }
  }, [isMyGovApproved, currentStep]);

  // Submit project after both approvals
  useEffect(() => {
    if (currentStep === 'submit' && !isSubmitting && !isProjectSubmitted) {
      if (!voteDeadline) return;
      
      try {
        // Convert deadline to timestamp
        const deadline = Math.floor(voteDeadline.getTime() / 1000);
        
        // Prepare payment amounts and schedule
        const paymentAmounts = paymentSchedule.map(item => 
          BigInt(Math.floor(parseFloat(item.amount) * 1e18))
        );
        const paySchedule = paymentSchedule.map(item => 
          BigInt(Math.floor((item.deadline?.getTime() || 0) / 1000))
        );
        
        submitProjectProposal(webUrl, deadline, paymentAmounts, paySchedule);
      } catch (err) {
        console.error("Error submitting project:", err);
      }
    }
  }, [currentStep, submitProjectProposal, isSubmitting, isProjectSubmitted, voteDeadline, webUrl, paymentSchedule]);

  const isFormValid = () => {
    return (
      webUrl.trim() !== "" &&
      voteDeadline !== undefined &&
      paymentSchedule.every(item => item.amount !== "" && item.deadline !== undefined) &&
      paymentSchedule.length > 0
    );
  };

  // Close modal on success
  useEffect(() => {
    if (isProjectSubmitted) {
      setWebUrl("");
      setVoteDeadline(undefined);
      setPaymentSchedule([{ amount: "", deadline: undefined }]);
      setCurrentStep('form');
      setOpen(false);
      onProjectSubmitted?.();
    }
  }, [isProjectSubmitted, onProjectSubmitted]);

  // Reset step when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep('form');
    }
  }, [open]);

  const getStepStatus = (step: string) => {
    switch (step) {
      case 'tltoken':
        if (isTLTokenApproved) return '✅ Approved';
        if (isTLTokenApproving) return '⏳ Approving...';
        if (tlTokenError) return '❌ Failed';
        return '⭕ Pending';
      case 'mygov':
        if (isMyGovApproved) return '✅ Approved';
        if (isMyGovApproving) return '⏳ Approving...';
        if (myGovError) return '❌ Failed';
        return '⭕ Pending';
      case 'submit':
        if (isProjectSubmitted) return '✅ Submitted';
        if (isSubmitting) return '⏳ Submitting...';
        if (projectError) return '❌ Failed';
        return '⭕ Pending';
      default:
        return '';
    }
  };

  const currentError = tlTokenError || myGovError || projectError;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl sm:max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">

        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Submit Project Proposal</DialogTitle>
          <DialogDescription>
            Create a new project proposal for the DAO to vote on. Include your project details and payment schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {currentStep !== 'form' && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Submission Progress</h3>
              <div className="space-y-2 text-sm">
                <div>1. TLToken Approval (4000 tokens): {getStepStatus('tltoken')}</div>
                <div>2. MyGov Approval (5 tokens): {getStepStatus('mygov')}</div>
                <div>3. Project Submission: {getStepStatus('submit')}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 py-2 min-h-[0]">
            {/* Project URL */}
            <div className="space-y-2">
              <Label htmlFor="webUrl">Project URL</Label>
              <Input
                id="webUrl"
                type="url"
                placeholder="https://your-project-details.com"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                required
                disabled={currentStep !== 'form'}
              />
              <p className="text-sm text-muted-foreground">
                Link to your project documentation, repository, or proposal details
              </p>
            </div>

            {/* Vote Deadline */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Vote Deadline
              </Label>
              <DateTimePicker
                value={voteDeadline}
                onChange={setVoteDeadline}
                placeholder="Select date and time"
                disabled={currentStep !== 'form'}
              />
              <p className="text-sm text-muted-foreground">
                When should the voting period end?
              </p>
            </div>

            {/* Payment Schedule */}
            <PaymentSchedule
              items={paymentSchedule}
              onItemsChange={setPaymentSchedule}
              disabled={currentStep !== 'form'}
            />

            {currentError && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20">
                <p className="text-sm text-destructive">
                  Error: {currentError.message || "Failed during submission process"}
                </p>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading || currentStep !== 'form'}
          >
            {currentStep === 'form' ? "Submit Proposal" : "Processing..."}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
