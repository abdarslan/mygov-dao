import { useMemo } from "react";
import { useContractRead, useMultiContractRead, useContractUtils } from "./useContract";
import type { SurveyView } from "../types/contracts";

/**
 * Hook to get the total number of surveys
 */
export const useSurveyCount = () => {
  const { data: numSurveys, isLoading, error } = useContractRead(
    'getter',
    'getNoOfSurveys',
    []
  );

  return {
    count: numSurveys ? Number(numSurveys) : 0,
    isLoading,
    error,
  };
};

/**
 * Hook to get survey information by ID
 */
export const useSurvey = (surveyId: number) => {
  const surveyResults = useMultiContractRead([
    { facet: 'getter', functionName: 'getSurveyInfo', args: [BigInt(surveyId)] },
    { facet: 'getter', functionName: 'getSurveyOwner', args: [BigInt(surveyId)] },
    { facet: 'getter', functionName: 'getSurveyResults', args: [BigInt(surveyId)] },
  ]);

  const isLoading = surveyResults.isLoading;
  const error = surveyResults.results.find(result => result.error)?.error;

  const survey = useMemo(() => {
    const [surveyInfo, surveyOwner, surveyResultsData] = surveyResults.data;
    
    if (!surveyInfo || !surveyOwner || !surveyResultsData) {
      return null;
    }

    const [webUrl, surveyDeadline, numChoices, atmostChoice] = surveyInfo as [string, bigint, bigint, bigint];
    const [numTaken, results] = surveyResultsData as [bigint, bigint[]];

    return {
      surveyId,
      surveyOwner: surveyOwner as string,
      webUrl,
      surveyDeadline,
      numChoices: Number(numChoices),
      atmostChoice: Number(atmostChoice),
      numTaken: Number(numTaken),
      results: results.map(r => Number(r)),
    } as SurveyView;
  }, [surveyResults.data, surveyId]);

  return {
    survey,
    isLoading,
    error,
  };
};

/**
 * Hook for survey utility functions
 */
export const useSurveyUtils = () => {
  const { formatDate, getStatusColor, truncateAddress } = useContractUtils();

  const getSurveyStatus = (deadline: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const deadlineSeconds = Number(deadline);
    
    if (deadlineSeconds < now) return "Completed";
    return "Active";
  };

  return {
    formatDate,
    getSurveyStatus,
    getStatusColor,
    truncateAddress,
  };
};
