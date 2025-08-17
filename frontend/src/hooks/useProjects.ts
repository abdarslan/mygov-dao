import { useMemo } from "react";
import { useContractRead, useContractWrite, useContractUtils } from "./useContract";
import type { ProjectView, ProjectStatus } from "../types/contracts";

/**
 * Hook to get the total number of project proposals
 */
export const useProjectCount = () => {
  const { data, isLoading, error, refetch } = useContractRead<bigint>('getter', 'getNoOfProjectProposals');
  
  return {
    count: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get projects data with pagination
 */
export const useProjects = (startIndex: number = 0, maxProjects: number = 10) => {
  const { count: totalProjects, refetch: refetchCount } = useProjectCount();
  
  const endIndex = useMemo(() => {
    return Math.min(startIndex + maxProjects, totalProjects);
  }, [startIndex, maxProjects, totalProjects]);

  const shouldFetch = totalProjects > 0 && endIndex > startIndex;

  const { data: projectsData, isLoading, error, refetch: refetchProjects } = useContractRead<ProjectView[]>(
    'getter',
    'getProjects',
    [BigInt(startIndex), BigInt(endIndex)],
    { enabled: shouldFetch }
  );

  const projects = useMemo(() => {
    return projectsData || [];
  }, [projectsData]);

  const refetchAll = async () => {
    await refetchCount();
    if (shouldFetch) {
      await refetchProjects();
    }
  };

  return {
    projects,
    totalProjects,
    isLoading,
    error,
    hasMore: endIndex < totalProjects,
    refetch: refetchAll,
  };
};

/**
 * Hook to get a single project by ID
 */
export const useProject = (projectId: number) => {
  const { data: projectInfo, isLoading: infoLoading, error: infoError } = useContractRead(
    'getter',
    'getProjectInfo',
    [BigInt(projectId)]
  );

  const { data: projectOwner, isLoading: ownerLoading } = useContractRead(
    'getter',
    'getProjectOwner',
    [BigInt(projectId)]
  );

  const { data: votes, isLoading: votesLoading } = useContractRead(
    'getter',
    'getNumOfVotes',
    [BigInt(projectId)]
  );

  const { data: tlReceived, isLoading: tlLoading } = useContractRead(
    'getter',
    'getTLReceivedByProject',
    [BigInt(projectId)]
  );

  const { data: isFunded, isLoading: fundedLoading } = useContractRead(
    'getter',
    'getIsProjectFunded',
    [BigInt(projectId)]
  );

  const isLoading = infoLoading || ownerLoading || votesLoading || tlLoading || fundedLoading;

  const project = useMemo(() => {
    if (!projectInfo || !projectOwner || !votes || tlReceived === undefined || isFunded === undefined) {
      return null;
    }

    const [webUrl, voteDeadline, paymentAmounts, paySchedule] = projectInfo as [string, bigint, bigint[], bigint[]];
    const [numOfVotesYes, numOfVotesNo] = votes as [bigint, bigint];

    return {
      projectId: BigInt(projectId),
      projectOwner: projectOwner as string,
      webUrl,
      voteDeadline,
      paymentAmounts,
      paySchedule,
      beingFunded: isFunded as boolean,
      tlReceived: tlReceived as bigint,
      numOfVotesYes,
      numOfVotesNo,
    } as ProjectView;
  }, [projectInfo, projectOwner, votes, tlReceived, isFunded, projectId]);

  return {
    project,
    isLoading,
    error: infoError,
  };
};

/**
 * Hook for project management functionality (reserve/withdraw)
 */
export const useProjectManagement = () => {
  const govWrite = useContractWrite('gov');

  const reserveProjectGrant = (projectId: number) => {
    govWrite.write('reserveProjectGrant', [BigInt(projectId)]);
  };

  const withdrawProjectPayment = (projectId: number) => {
    govWrite.write('withdrawProjectTLPayment', [BigInt(projectId)]);
  };

  return {
    reserveProjectGrant,
    withdrawProjectPayment,
    isProcessing: govWrite.isPending || govWrite.isConfirming,
    isSuccess: govWrite.isSuccess,
    error: govWrite.error,
    txHash: govWrite.hash,
  };
};

/**
 * Hook to get project eligibility for payment
 */
export const useProjectPaymentEligibility = (projectId: number) => {
  const { data: isEligible, isLoading, refetch } = useContractRead<boolean>(
    'getter',
    'getProjectEligibleForPayment',
    [BigInt(projectId)]
  );

  return {
    isEligible: !!isEligible,
    isLoading,
    refetch,
  };
};

/**
 * Hook for project voting functionality
 */
export const useProjectVoting = () => {
  const govWrite = useContractWrite('gov');

  const voteForProject = (projectId: number, vote: boolean) => {
    govWrite.write('voteForProjectProposal', [BigInt(projectId), vote]);
  };

  const voteForProjectPayment = (projectId: number, vote: boolean) => {
    govWrite.write('voteForProjectPayment', [BigInt(projectId), vote]);
  };

  const delegateVote = (memberAddress: string, projectId: number) => {
    govWrite.write('delegateVoteTo', [memberAddress as `0x${string}`, BigInt(projectId)]);
  };

  return {
    voteForProject,
    voteForProjectPayment,
    delegateVote,
    isVoting: govWrite.isPending || govWrite.isConfirming,
    isSuccess: govWrite.isSuccess,
    error: govWrite.error,
    txHash: govWrite.hash,
  };
};

/**
 * Hook for creating new project proposals with approval workflow
 */
export const useProjectCreation = () => {
  const govWrite = useContractWrite('gov');
  const tlTokenWrite = useContractWrite('tltoken');
  const myGovWrite = useContractWrite('erc20');

  // Contract addresses
  const diamondAddress = "0x002e176ABb7045260dEef1976DD3A9031D836D5B"; // From addresses.json

  const submitProjectProposal = (
    webUrl: string,
    voteDeadline: number,
    paymentAmounts: bigint[],
    paySchedule: bigint[]
  ) => {
    govWrite.write('submitProjectProposal', [
      webUrl,
      BigInt(voteDeadline),
      paymentAmounts,
      paySchedule
    ]);
  };

  const approveTLToken = () => {
    // Approve 4000 TLToken (with 18 decimals)
    const amount = BigInt('4000000000000000000000'); // 4000 * 10^18
    tlTokenWrite.write('approve', [diamondAddress, amount]);
  };

  const approveMyGov = () => {
    // Approve 5 MyGov tokens (with 18 decimals)
    const amount = BigInt('5000000000000000000'); // 5 * 10^18
    myGovWrite.write('approve', [diamondAddress, amount]);
  };

  return {
    // Project submission
    submitProjectProposal,
    isSubmitting: govWrite.isPending || govWrite.isConfirming,
    isProjectSubmitted: govWrite.isSuccess,
    projectError: govWrite.error,
    projectTxHash: govWrite.hash,

    // TLToken approval
    approveTLToken,
    isTLTokenApproving: tlTokenWrite.isPending || tlTokenWrite.isConfirming,
    isTLTokenApproved: tlTokenWrite.isSuccess,
    tlTokenError: tlTokenWrite.error,
    tlTokenTxHash: tlTokenWrite.hash,

    // MyGov approval
    approveMyGov,
    isMyGovApproving: myGovWrite.isPending || myGovWrite.isConfirming,
    isMyGovApproved: myGovWrite.isSuccess,
    myGovError: myGovWrite.error,
    myGovTxHash: myGovWrite.hash,

    // Overall state
    isLoading: govWrite.isPending || govWrite.isConfirming || 
               tlTokenWrite.isPending || tlTokenWrite.isConfirming ||
               myGovWrite.isPending || myGovWrite.isConfirming,
  };
};

/**
 * Hook for project utility functions
 */
export const useProjectUtils = () => {
  const { formatDate, getStatusColor, truncateAddress, truncateText } = useContractUtils();

  const getProjectStatus = (project: ProjectView): ProjectStatus => {
    const now = Math.floor(Date.now() / 1000);
    const deadline = Number(project.voteDeadline);
    
    if (project.beingFunded) return "Funded";
    if (deadline < now) return "Voting Ended";
    return "Active Voting";
  };

  return {
    formatDate,
    getProjectStatus,
    getStatusColor,
    truncateAddress,
    truncateUrl: truncateText,
  };
};
