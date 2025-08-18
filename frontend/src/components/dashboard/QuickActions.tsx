import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Vote, Gift, Settings, ExternalLink } from "lucide-react";
import { useState } from "react";

export function QuickActions() {
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const handleCreateProject = () => {
    setIsCreatingProject(true);
    // Navigate to project creation
    setTimeout(() => {
      setIsCreatingProject(false);
      // Add actual navigation logic here
      console.log("Navigate to project creation");
    }, 1000);
  };

  const handleGovernanceVote = () => {
    // Navigate to governance voting
    console.log("Navigate to governance voting");
  };

  const handleDonate = () => {
    // Navigate to donation
    console.log("Navigate to donation");
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log("Navigate to settings");
  };

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Create Project */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Project</AlertDialogTitle>
              <AlertDialogDescription>
                You're about to create a new project proposal. This will require a minimum token balance 
                and will be subject to community voting. Are you ready to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCreateProject}
                disabled={isCreatingProject}
              >
                {isCreatingProject ? "Creating..." : "Create Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Participate in Governance */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Vote className="w-4 h-4 mr-2" />
              Governance Voting
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Participate in Governance</AlertDialogTitle>
              <AlertDialogDescription>
                Review and vote on active project proposals. Your vote weight is determined by your 
                token balance. Navigate to the governance section?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleGovernanceVote}>
                Go to Voting
                <ExternalLink className="w-4 h-4 ml-2" />
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Make Donation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Gift className="w-4 h-4 mr-2" />
              Make Donation
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Make a Donation</AlertDialogTitle>
              <AlertDialogDescription>
                Support the DAO by donating TL or MyGov tokens. Donations help fund approved projects 
                and grow the community treasury. Proceed to donation interface?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDonate}>
                Donate Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Token Management */}
        <Button className="w-full justify-start" variant="outline" onClick={handleSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Token Management
        </Button>
      </CardContent>
    </Card>
  );
}
