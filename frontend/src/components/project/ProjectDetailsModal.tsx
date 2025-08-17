import { useState } from "react";
import { useAccount } from "wagmi";
import { ExternalLink, Calendar, DollarSign, User, Clock, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VotingCard } from "./VotingCard";
import { ProjectManagementButtons } from "./ProjectManagementButtons";
import { format } from "date-fns";

interface ProjectDetailsModalProps {
  children: React.ReactNode;
  project: {
    id: string;
    title: string;
    description: string;
    url: string;
    voteDeadline: Date;
    totalFunding: number;
    currentVotes: number;
    yesVotes: number;
    noVotes: number;
    status: "active" | "pending" | "completed" | "failed";
    createdAt: Date;
    paymentAmounts: number[];
    paySchedule: Date[];
    projectOwner: string;
    beingFunded: boolean;
    hasUserVoted?: boolean;
    userVoteChoice?: boolean;
    hasDelegated?: boolean;
    delegatedTo?: string;
  };
}

export function ProjectDetailsModal({ children, project }: ProjectDetailsModalProps) {
  const { address: connectedAccount } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [localYesVotes, setLocalYesVotes] = useState(project.yesVotes);
  const [localNoVotes, setLocalNoVotes] = useState(project.noVotes);
  const [localCurrentVotes, setLocalCurrentVotes] = useState(project.currentVotes);

  const isVotingActive = new Date() < project.voteDeadline && project.status === "active";
  const totalPayments = project.paymentAmounts.reduce((sum, amount) => sum + amount, 0);
  
  // Check if connected account is the project owner
  const isProjectOwner = connectedAccount?.toLowerCase() === project.projectOwner.toLowerCase();

  const handleVoteSuccess = (voteChoice: boolean) => {
    if (voteChoice) {
      setLocalYesVotes(prev => prev + 1);
    } else {
      setLocalNoVotes(prev => prev + 1);
    }
    setLocalCurrentVotes(prev => prev + 1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="w-4 h-4 text-green-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl min-h-[80vh] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{project.title}</span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full ${isProjectOwner ? 'grid-cols-4' : 'grid-cols-3'} bg-transparent border-b border-border rounded-none p-0 h-auto`}>
            <TabsTrigger 
              value="overview" 
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="voting"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3"
            >
              Voting
            </TabsTrigger>
            {isProjectOwner && (
              <TabsTrigger 
                value="management"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3"
              >
                Management
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="funding"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3"
            >
              Funding
            </TabsTrigger>
          </TabsList>

          <div className="mt-0 min-h-[453px]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-3 mt-0">
              {/* Project Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Project Information</CardTitle>
                </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Project URL</p>
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate"
                      >
                        {project.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Project Owner</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {project.projectOwner.slice(0, 6)}...{project.projectOwner.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Vote Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {format(project.voteDeadline, "PPP 'at' HH:mm")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Total Funding</p>
                      <p className="text-sm text-muted-foreground">
                        {project.totalFunding.toLocaleString()} TL
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-2 text-center">
                  <div className="text-2xl font-bold text-green-600">{localYesVotes}</div>
                  <div className="text-sm text-muted-foreground">Yes Votes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-2 text-center">
                  <div className="text-2xl font-bold text-red-600">{localNoVotes}</div>
                  <div className="text-sm text-muted-foreground">No Votes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-2 text-center">
                  <div className="text-2xl font-bold text-blue-600">{localCurrentVotes}</div>
                  <div className="text-sm text-muted-foreground">Total Votes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-2 text-center">
                  <div className="text-2xl font-bold text-purple-600">{project.paymentAmounts.length}</div>
                  <div className="text-sm text-muted-foreground">Payment Phases</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting" className="mt-0 min-h-[454px]">
            <VotingCard
              projectId={parseInt(project.id)}
              voteDeadline={project.voteDeadline}
              yesVotes={localYesVotes}
              noVotes={localNoVotes}
              hasUserVoted={project.hasUserVoted}
              userVoteChoice={project.userVoteChoice}
              hasDelegated={project.hasDelegated}
              delegatedTo={project.delegatedTo}
              isVotingActive={isVotingActive}
              onVoteSuccess={handleVoteSuccess}
            />
          </TabsContent>

          {/* Management Tab - Only show for project owner */}
          {isProjectOwner && (
            <TabsContent value="management" className="mt-0 min-h-[454px]">
              <ProjectManagementButtons
                projectId={parseInt(project.id)}
                projectOwner={project.projectOwner}
                voteDeadline={project.voteDeadline}
                paySchedule={project.paySchedule}
                yesVotes={localYesVotes}
                noVotes={localNoVotes}
                beingFunded={project.beingFunded}
                onSuccess={() => {
                  // Could add refresh logic here if needed
                  console.log('Project management action successful');
                }}
              />
            </TabsContent>
          )}

          {/* Funding Tab */}
          <TabsContent value="funding" className="space-y-6 mt-0 min-h-[454px]">
            <Card>
              <CardHeader>
                <CardTitle>Funding Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Requested</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalPayments.toLocaleString()} TL
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Funding Status</p>
                    <p className={`text-sm font-medium ${project.beingFunded ? 'text-green-600' : 'text-yellow-600'}`}>
                      {project.beingFunded ? 'Funded' : 'Pending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.paymentAmounts.map((amount, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">Payment {index + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(project.paySchedule[index], "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{amount.toLocaleString()} TL</p>
                        <p className="text-sm text-muted-foreground">
                          {((amount / totalPayments) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
