import { Plus, DollarSign, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSubmissionModal } from "./ProjectSubmissionModal";
import { ProjectDetailsModal } from "./ProjectDetailsModal";
import { format } from "date-fns";

interface Project {
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
}

interface ProjectCardProps {
  project?: Project;
  isNewProject?: boolean;
  className?: string;
}

export function ProjectCard({
  project,
  isNewProject = false,
  className,
}: ProjectCardProps) {
  if (isNewProject) {
    return (
      <ProjectSubmissionModal>
        <Card 
          className={`border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer group ${className}`}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Create New Project</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Submit a new project proposal to the DAO for funding consideration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ProjectSubmissionModal>
    );
  }

  if (!project) return null;

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {project.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </div>
          <div 
            className={`ml-2 flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}
          >
            {getStatusText(project.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Project URL */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>
          <span className="text-muted-foreground truncate">
            {project.url}
          </span>
        </div>

        {/* Funding & Votes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div className="text-sm">
              <p className="font-medium">{project.totalFunding.toLocaleString()} TL</p>
              <p className="text-xs text-muted-foreground">Total Funding</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <div className="text-sm">
              <p className="font-medium">{project.yesVotes}/{project.noVotes}</p>
              <p className="text-xs text-muted-foreground">Yes/No Votes</p>
            </div>
          </div>
        </div>

        {/* Vote Deadline */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-orange-600" />
          <div>
            <p className="font-medium">Vote Deadline</p>
            <p className="text-xs text-muted-foreground">
              {format(project.voteDeadline, "PPP 'at' HH:mm")}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <ProjectDetailsModal project={project}>
          <Button 
            variant="outline" 
            className="w-full"
          >
            View Details
          </Button>
        </ProjectDetailsModal>
      </CardContent>
    </Card>
  );
}

// Example usage component for the grid layout
interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* New Project Card - Always first */}
      <ProjectCard
        isNewProject
      />
      
      {/* Existing Projects */}
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
        />
      ))}
    </div>
  );
}
