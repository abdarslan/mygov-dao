import { useContractRead, useContractWrite } from "./useContract";

/**
 * Hook for voting on project payments
 */
export const useProjectPaymentVoting = () => {
  const govWrite = useContractWrite('gov');

  const voteForPayment = (projectId: number, choice: boolean) => {
    govWrite.write('voteForProjectPayment', [BigInt(projectId), choice]);
  };

  return {
    voteForPayment,
    isVoting: govWrite.isPending || govWrite.isConfirming,
    isSuccess: govWrite.isSuccess,
    error: govWrite.error,
    txHash: govWrite.hash,
  };
};

/**
 * Hook for voting on surveys
 */
export const useSurveyVoting = () => {
  const surveyWrite = useContractWrite('survey');

  const takeSurvey = (surveyId: number, choices: number[]) => {
    surveyWrite.write('takeSurvey', [BigInt(surveyId), choices.map(c => BigInt(c))]);
  };

  return {
    takeSurvey,
    isVoting: surveyWrite.isPending || surveyWrite.isConfirming,
    isSuccess: surveyWrite.isSuccess,
    error: surveyWrite.error,
    txHash: surveyWrite.hash,
  };
};

/**
 * Hook for checking if a user has participated in a survey
 */
export const useSurveyParticipation = (userAddress: string, surveyId: number) => {
  const { data: hasParticipated, isLoading } = useContractRead(
    'getter',
    'getIfSurveyTaken',
    [userAddress as `0x${string}`, BigInt(surveyId)]
  );

  return {
    hasParticipated: Boolean(hasParticipated),
    isLoading,
  };
};

/**
 * Hook for donation functionality
 */
export const useDonations = () => {
  const donationWrite = useContractWrite('donation');

  const donateToProject = (projectId: number, amount: bigint) => {
    donationWrite.write('donateEther', [BigInt(projectId)], amount);
  };

  return {
    donateToProject,
    isDonating: donationWrite.isPending || donationWrite.isConfirming,
    isSuccess: donationWrite.isSuccess,
    error: donationWrite.error,
    txHash: donationWrite.hash,
  };
};
