import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSurveyCount, useSurvey, useSurveyUtils } from "@/hooks";

const SurveyPage: React.FC = () => {
  const { count: totalSurveys, isLoading: countLoading } = useSurveyCount();
  
  // For demo purposes, show first few surveys if they exist
  const surveyIds = Array.from({ length: Math.min(totalSurveys, 4) }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Surveys</h2>
        <p className="text-gray-600">
          {totalSurveys > 0 
            ? `Create and participate in ${totalSurveys} community survey${totalSurveys !== 1 ? 's' : ''}`
            : "Create and participate in community surveys"
          }
        </p>
      </div>
      
      {countLoading ? (
        <div className="text-center">
          <p className="text-gray-600">Loading surveys...</p>
        </div>
      ) : totalSurveys > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {surveyIds.map((surveyId) => (
            <SurveyCard key={surveyId} surveyId={surveyId} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 p-8">
            <p className="text-gray-600 mb-4">No surveys found.</p>
            <p className="text-sm text-gray-500">Create the first survey to get started!</p>
          </Card>
        </div>
      )}
      
      <div className="text-center mt-8">
        <Button className="backdrop-blur-sm bg-gradient-to-r from-green-500/80 to-blue-600/80 hover:from-green-600/90 hover:to-blue-700/90 text-white border border-green-400/30 shadow-lg transition-all duration-300 hover:scale-105 px-8 py-2">
          Create New Survey
        </Button>
      </div>
    </div>
  );
};

// Component for individual survey cards
const SurveyCard: React.FC<{ surveyId: number }> = ({ surveyId }) => {
  const { survey, isLoading, error } = useSurvey(surveyId);
  const { truncateAddress, formatDate, getSurveyStatus, getStatusColor } = useSurveyUtils();

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !survey) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading survey #{surveyId}</p>
        </CardContent>
      </Card>
    );
  }

  const status = getSurveyStatus(survey.surveyDeadline);
  const isActive = status === "Active";

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {isActive ? "🗳️" : "📊"} Survey #{survey.surveyId}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Owner: {truncateAddress(survey.surveyOwner)}
        </p>
      </CardHeader>
      <CardContent>
        {survey.webUrl && (
          <p className="text-gray-600 mb-2 text-sm">
            URL: <a href={survey.webUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {survey.webUrl.length > 25 ? survey.webUrl.substring(0, 25) + "..." : survey.webUrl}
            </a>
          </p>
        )}
        <p className="text-gray-600 mb-2 text-sm">
          Deadline: {formatDate(survey.surveyDeadline)}
        </p>
        <p className="text-gray-600 mb-2 text-sm">
          Choices: {survey.numChoices} (Max: {survey.atmostChoice})
        </p>
        <p className="text-gray-600 mb-4 text-sm">
          Participants: {survey.numTaken}
        </p>
        
        {!isActive && survey.results.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Results:</p>
            <div className="space-y-1">
              {survey.results.map((votes, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>Option {index + 1}:</span>
                  <span>{votes} votes</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${getStatusColor(status)}`}>
            Status: {status}
          </span>
          <Button 
            size="sm" 
            className={`backdrop-blur-sm ${
              isActive 
                ? "bg-green-500/80 hover:bg-green-600/90 border-green-400/30" 
                : "bg-blue-500/80 hover:bg-blue-600/90 border-blue-400/30"
            } text-white border shadow-lg transition-all duration-300 hover:scale-105`}
            onClick={() => survey.webUrl && window.open(survey.webUrl, '_blank')}
          >
            {isActive ? "Participate" : "View Results"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyPage;
