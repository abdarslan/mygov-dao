import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectVoting } from "@/hooks/useProjects";

interface VotingCardProps {
  projectId: number;
  voteDeadline: Date;
  yesVotes: number;
  noVotes: number;
  hasUserVoted?: boolean;
  userVoteChoice?: boolean;
  hasDelegated?: boolean;
  delegatedTo?: string;
  isVotingActive: boolean;
  onVoteSuccess?: (voteChoice: boolean) => void;
}

export function VotingCard({
  projectId,
  voteDeadline,
  yesVotes: initialYesVotes,
  noVotes: initialNoVotes,
  hasUserVoted = false,
  userVoteChoice,
  hasDelegated = false,
  delegatedTo,
  isVotingActive,
  onVoteSuccess,
}: VotingCardProps) {
  const [delegateAddress, setDelegateAddress] = useState("");
  const [showDelegateInput, setShowDelegateInput] = useState(false);
  const [localYesVotes, setLocalYesVotes] = useState(initialYesVotes);
  const [localNoVotes, setLocalNoVotes] = useState(initialNoVotes);
  const [localHasUserVoted, setLocalHasUserVoted] = useState(hasUserVoted);
  const [localUserVoteChoice, setLocalUserVoteChoice] = useState(userVoteChoice);
  
  const { voteForProject, delegateVote, isVoting, isSuccess, error } = useProjectVoting();

  // Update local state when props change
  useEffect(() => {
    setLocalYesVotes(initialYesVotes);
    setLocalNoVotes(initialNoVotes);
    setLocalHasUserVoted(hasUserVoted);
    setLocalUserVoteChoice(userVoteChoice);
  }, [initialYesVotes, initialNoVotes, hasUserVoted, userVoteChoice]);

  // Handle successful vote transactions
  useEffect(() => {
    if (isSuccess && !localHasUserVoted) {
      // Call the callback if provided
      onVoteSuccess?.(localUserVoteChoice || false);
      setShowDelegateInput(false);
    }
  }, [isSuccess, localHasUserVoted, localUserVoteChoice, onVoteSuccess]);

  const totalVotes = localYesVotes + localNoVotes;
  const yesPercentage = totalVotes > 0 ? (localYesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (localNoVotes / totalVotes) * 100 : 0;

  const handleVote = (choice: boolean) => {
    voteForProject(projectId, choice);
    // Optimistically update the UI
    if (choice) {
      setLocalYesVotes(prev => prev + 1);
    } else {
      setLocalNoVotes(prev => prev + 1);
    }
    setLocalHasUserVoted(true);
    setLocalUserVoteChoice(choice);
  };

  const handleDelegate = () => {
    if (!delegateAddress) return;
    delegateVote(delegateAddress, projectId);
    setShowDelegateInput(false);
  };

  const isVotingExpired = new Date() > voteDeadline;
  const canVote = isVotingActive && !localHasUserVoted && !hasDelegated && !isVotingExpired;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Voting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vote Results */}
        <div className="space-y-4">
          <h4 className="font-medium">Current Results</h4>
          
          {/* Yes Votes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Yes</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {localYesVotes} votes ({yesPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
          </div>

          {/* No Votes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">No</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {localNoVotes} votes ({noPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${noPercentage}%` }}
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Total votes: {totalVotes}
          </div>
        </div>

        {/* User Status */}
        {localHasUserVoted && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                You voted: {localUserVoteChoice ? "Yes" : "No"}
              </span>
            </div>
          </div>
        )}

        {hasDelegated && delegatedTo && (
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Vote delegated to: {delegatedTo.slice(0, 6)}...{delegatedTo.slice(-4)}
              </span>
            </div>
          </div>
        )}

        {isVotingExpired && (
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-sm text-muted-foreground">
              Voting period has ended
            </span>
          </div>
        )}

        {/* Voting Interface */}
        {canVote && (
          <div className="space-y-4">
            {/* Direct Voting Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={() => handleVote(true)}
                disabled={isVoting}
              >
                <ThumbsUp className="w-4 h-4" />
                Vote Yes
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleVote(false)}
                disabled={isVoting}
              >
                <ThumbsDown className="w-4 h-4" />
                Vote No
              </Button>
            </div>

            {/* Delegate Vote Section */}
            <div className="border-t pt-4">
              {!showDelegateInput ? (
                <Button
                  variant="secondary"
                  className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300"
                  onClick={() => setShowDelegateInput(true)}
                  disabled={isVoting}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Delegate Vote
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="delegate-address">Delegate Address</Label>
                    <Input
                      id="delegate-address"
                      placeholder="0x..."
                      value={delegateAddress}
                      onChange={(e) => setDelegateAddress(e.target.value)}
                      disabled={isVoting}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDelegateInput(false)}
                      disabled={isVoting}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={handleDelegate}
                      disabled={isVoting || !delegateAddress}
                    >
                      {isVoting ? "Delegating..." : "Delegate Vote"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {isVoting && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-sm text-blue-900">Processing transaction...</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <span className="text-sm text-green-900">Transaction successful!</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <span className="text-sm text-red-900">
              Error: {error.message || "Transaction failed"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
