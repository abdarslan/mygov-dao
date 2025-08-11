// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISurvey {
    event SurveySubmitted (
        uint indexed surveyid,
        address indexed surveyowner
    );
    /**
     * @notice Submits a new survey proposal.
     * @param weburl The URL associated with the survey.
     * @param surveydeadline The timestamp when the survey ends.
     * @param numchoices The total number of possible choices in the survey.
     * @param atmostchoice The maximum number of choices a user can select.
     * @return surveyid The ID of the newly created survey.
     */
    function submitSurvey(
        string memory weburl,
        uint surveydeadline,
        uint numchoices,
        uint atmostchoice
    ) external returns (uint surveyid);

    /**
     * @notice Allows a member to take a specific survey.
     * @param surveyid The ID of the survey to take.
     * @param choices An array of the indices of the choices selected by the user.
     */
    function takeSurvey(
        uint surveyid,
        uint[] memory choices
    ) external;
}