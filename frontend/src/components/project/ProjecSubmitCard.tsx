import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectSubmissionModal } from "./ProjectSubmissionModal";

export function ProjectSubmitCard() {
  return (
    <Card className="border-dashed border-1 hover:border-primary/50 transition-colors">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground">
          <Plus className="w-5 h-5" />
          Submit New Project
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Have a project idea? Submit it for the DAO to vote on and get funding for your work.
        </p>
        <ProjectSubmissionModal>
          <Button className="w-full">
            Create Project Proposal
          </Button>
        </ProjectSubmissionModal>
      </CardContent>
    </Card>
  );
}
