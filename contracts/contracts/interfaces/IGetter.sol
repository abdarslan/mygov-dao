// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGetter {
    function getSurveyResults(uint surveyid) external view returns (uint numtaken, uint[] memory results);

    function getSurveyInfo(uint surveyid)
        external
        view
        returns (
            string memory weburl,
            uint surveydeadline,
            uint numchoices,
            uint atmostchoice
        );

    function getSurveyOwner(uint surveyid) external view returns (address surveyowner);

    function getIsProjectFunded(uint projectid) external view returns (bool funded);

    function getProjectNextTLPayment(uint projectid) external view returns (int next);

    function getProjectOwner(uint projectid) external view returns (address projectowner);

    function getProjectInfo(uint activityid)
        external
        view
        returns (
            string memory weburl,
            uint votedeadline,
            uint[] memory paymentamounts,
            uint[] memory payschedule
        );

    function getNoOfProjectProposals() external view returns (uint numproposals);

    function getNoOfFundedProjects() external view returns (uint numfunded);

    function getTLReceivedByProject(uint projectid) external view returns (uint amount);

    function getNoOfSurveys() external view returns (uint numsurveys);

    function getNumOfVotes(uint projectid) external view returns (uint yes, uint no);

    function getNumOfVotesPayment(uint projectid) external view returns (uint yes, uint no);

    function getProjectEligibleForPayment(uint projectid) external view returns (bool eligible);

        function isMember(
        address user
    ) external view returns (bool result);
}
