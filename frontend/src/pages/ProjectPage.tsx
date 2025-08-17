import { useMemo } from "react";
import { ProjectGrid } from "@/components/project/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { formatUnits } from "viem";
import type { ProjectView } from "@/types/contracts";

// Transform contract data to UI format
const transformProjectData = (contractProject: ProjectView) => {
  const now = Date.now();
  const voteDeadline = new Date(Number(contractProject.voteDeadline) * 1000);
  const isVotingActive = voteDeadline.getTime() > now;
  const totalVotes = Number(contractProject.numOfVotesYes) + Number(contractProject.numOfVotesNo);
  
  // Convert TL token amounts from Wei (18 decimals) to display format
  const totalFunding = contractProject.paymentAmounts.reduce((sum, amount) => {
    return sum + Number(formatUnits(amount, 18));
  }, 0);

  let status: "active" | "pending" | "completed" | "failed";
  if (contractProject.beingFunded) {
    status = "completed";
  } else if (isVotingActive) {
    status = "active";
  } else if (voteDeadline.getTime() <= now && !contractProject.beingFunded) {
    // Check if voting passed (simple majority for now)
    const yesVotes = Number(contractProject.numOfVotesYes);
    const noVotes = Number(contractProject.numOfVotesNo);
    status = yesVotes > noVotes ? "pending" : "failed";
  } else {
    status = "pending";
  }

  return {
    id: contractProject.projectId.toString(),
    title: `Project #${contractProject.projectId}`, // You might want to store titles on-chain
    description: `View project details and vote on this proposal. ${contractProject.webUrl.substring(0, 100)}...`,
    url: contractProject.webUrl,
    voteDeadline,
    totalFunding,
    currentVotes: totalVotes,
    yesVotes: Number(contractProject.numOfVotesYes),
    noVotes: Number(contractProject.numOfVotesNo),
    status,
    createdAt: new Date(), // Contract doesn't store creation time, using current time
    paymentAmounts: contractProject.paymentAmounts.map(amount => Number(formatUnits(amount, 18))),
    paySchedule: contractProject.paySchedule.map(timestamp => new Date(Number(timestamp) * 1000)),
    projectOwner: contractProject.projectOwner,
    beingFunded: contractProject.beingFunded,
    // These would typically come from additional contract calls
    hasUserVoted: false, // TODO: Implement user vote status check
    userVoteChoice: undefined,
    hasDelegated: false, // TODO: Implement delegation status check
    delegatedTo: undefined,
  };
};

export function ProjectPage() {
  const { projects: contractProjects, isLoading, error, totalProjects, refetch } = useProjects(0, 50);

  const transformedProjects = useMemo(() => {
    return contractProjects.map(transformProjectData);
  }, [contractProjects]);

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Browse and submit project proposals for the DAO
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-red-600">Error loading projects: {error.message}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Browse and submit project proposals for the DAO
          </p>
          {totalProjects > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalProjects} total project{totalProjects !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {!isLoading && (
          <button 
            onClick={() => refetch()}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Refresh
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* New Project Card */}
          <div className="border-2 border-dashed border-primary/30 rounded-lg min-h-[280px] animate-pulse bg-primary/5" />
          {/* Loading skeletons */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-lg min-h-[280px] animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <ProjectGrid 
          projects={transformedProjects}
        />
      )}
    </div>
  );
}
