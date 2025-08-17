// Contract type definitions

export interface ProjectView {
  projectId: bigint;
  projectOwner: string;
  webUrl: string;
  voteDeadline: bigint;
  paymentAmounts: bigint[];
  paySchedule: bigint[];
  beingFunded: boolean;
  tlReceived: bigint;
  numOfVotesYes: bigint;
  numOfVotesNo: bigint;
}

export interface SurveyView {
  surveyId: number;
  surveyOwner: string;
  webUrl: string;
  surveyDeadline: bigint;
  numChoices: number;
  atmostChoice: number;
  numTaken: number;
  results: number[];
}

// Additional types can be added here as needed
export type ProjectStatus = "Funded" | "Active Voting" | "Voting Ended";
