//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibSurveyStorage} from "../libraries/LibSurveyStorage.sol";
import {LibGovStorage} from "../libraries/LibGovStorage.sol";
import {IGetter} from "../interfaces/IGetter.sol";

contract GetterFacet is IGetter {
    function getSurveyResults(
        uint surveyid
    ) external view returns (uint numtaken, uint[] memory results) {
        LibSurveyStorage.SurveyData storage ss = LibSurveyStorage
            .SurveyStorage();
        LibSurveyStorage.Survey storage tempSurvey = ss.surveys[surveyid];
        require(tempSurvey.surveyowner != address(0), "Survey does not exist");
        numtaken = tempSurvey.numtaken;
        results = new uint[](tempSurvey.numchoices);
        for (uint i = 0; i < tempSurvey.numchoices; i++) {
            results[i] = tempSurvey.results[i];
        }
        return (numtaken, results);
    }

    function getSurveyInfo(
        uint surveyid
    )
        external
        view
        returns (
            string memory weburl,
            uint surveydeadline,
            uint numchoices,
            uint atmostchoice
        )
    {
        LibSurveyStorage.SurveyData storage ss = LibSurveyStorage
            .SurveyStorage();
        LibSurveyStorage.Survey storage tempSurvey = ss.surveys[surveyid];
        require(tempSurvey.surveyowner != address(0), "Survey does not exist");
        weburl = tempSurvey.weburl;
        surveydeadline = tempSurvey.surveydeadline;
        numchoices = tempSurvey.numchoices;
        atmostchoice = tempSurvey.atmostchoice;
        return (weburl, surveydeadline, numchoices, atmostchoice);
    }

    function getSurveyOwner(
        uint surveyid
    ) external view returns (address surveyowner) {
        LibSurveyStorage.SurveyData storage ss = LibSurveyStorage
            .SurveyStorage();
        LibSurveyStorage.Survey storage tempSurvey = ss.surveys[surveyid];
        require(tempSurvey.surveyowner != address(0), "Survey does not exist");
        surveyowner = tempSurvey.surveyowner;
    }

    function getIsProjectFunded(
        uint projectid
    ) external view returns (bool funded) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        require(
            tempProject.projectowner != address(0),
            "Project does not exist"
        );
        funded = tempProject.beingFunded;
    }

    function getProjectNextTLPayment(
        uint projectid
    ) external view returns (int next) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        require(
            tempProject.projectowner != address(0),
            "Project does not exist"
        );
        for (uint i = 0; i < tempProject.paymentamounts.length; i++) {
            if (tempProject.paymentamounts[i] != 0) {
                next = int(tempProject.paymentamounts[i]);
                return next;
            }
        }
        revert("No payments left");
    }

    function getProjectOwner(
        uint projectid
    ) external view returns (address projectowner) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        require(
            tempProject.projectowner != address(0),
            "Project does not exist"
        );
        projectowner = tempProject.projectowner;
    }

    function getProjectInfo(
        uint activityid
    )
        external
        view
        returns (
            string memory weburl,
            uint votedeadline,
            uint[] memory paymentamounts,
            uint[] memory payschedule
        )
    {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[activityid];
        require(
            tempProject.projectowner != address(0),
            "Project does not exist"
        );
        weburl = tempProject.weburl;
        votedeadline = tempProject.votedeadline;
        paymentamounts = tempProject.paymentamounts;
        payschedule = tempProject.payschedule;
    }

    function getNoOfProjectProposals() external view returns (uint numproposals) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        uint numOfProjects = gs.numOfProjects;
        numproposals = numOfProjects;
    }

    function getNoOfFundedProjects() external view returns (uint numfunded) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        uint numOfFundedProjects = gs.numOfFundedProjects;
        numfunded = numOfFundedProjects;
    }

    function getTLReceivedByProject(
        uint projectid
    ) external view returns (uint amount) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        require(
            tempProject.projectowner != address(0),
            "Project does not exist"
        );
        amount = tempProject.tlreceived;
    }

    function getNoOfSurveys() external view returns (uint numsurveys) {
        LibSurveyStorage.SurveyData storage ss = LibSurveyStorage
            .SurveyStorage();
        uint numOfSurveys = ss.numOfSurveys;
        numsurveys = numOfSurveys;
    }

    function getNumOfVotes(
        uint projectid
    ) external view returns (uint yes, uint no) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        require(
            tempProject.projectowner != address(0),
            "Project does not exist"
        );
        yes = tempProject.numOfVotesYes;
        no = tempProject.numOfVotesNo;
        return (yes, no);
    }

    function getNumOfVotesPayment(
        uint projectid
    ) external view returns (uint yes, uint no) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        require(
            tempProject.projectowner != address(0),
            "Project does not exist"
        );
        yes = tempProject.numOfVotesYesPayment;
        no = tempProject.numOfVotesNoPayment;
        return (yes, no);
    }

    //check if project is eligible for payment
    function getProjectEligibleForPayment(
        uint projectid
    ) external view returns (bool eligible) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        require(tempProject.projectowner != address(0), "Project does not exist");
        if (tempProject.numOfVotesYesPayment * 100 >= gs.members) {
            return true;
        } else {
            return false;
        }
    }

    function isMember(
        address user
    ) external view returns (bool result) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        result = gs.isMember[user];
    }

    function getNumOfMembers() external view returns (uint numMembers) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        numMembers = gs.members;
    }

    struct ProjectView {
        uint projectId;
        address projectOwner;
        string webUrl;
        uint voteDeadline;
        uint[] paymentAmounts;
        uint[] paySchedule;
        bool beingFunded;
        uint tlReceived;
        uint numOfVotesYes;
        uint numOfVotesNo;
    }

    function getProjects(uint startIndex, uint endIndex) external view returns (ProjectView[] memory) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        uint numOfProjects = gs.numOfProjects;
        if (endIndex > numOfProjects) {
            endIndex = numOfProjects;
        }
        ProjectView[] memory projects = new ProjectView[](endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            LibGovStorage.Project storage tempProject = gs.projects[i];
            projects[i - startIndex] = ProjectView({
                projectId: i,
                projectOwner: tempProject.projectowner,
                webUrl: tempProject.weburl,
                voteDeadline: tempProject.votedeadline,
                paymentAmounts: tempProject.paymentamounts,
                paySchedule: tempProject.payschedule,
                beingFunded: tempProject.beingFunded,
                tlReceived: tempProject.tlreceived,
                numOfVotesYes: tempProject.numOfVotesYes,
                numOfVotesNo: tempProject.numOfVotesNo
            });
        }
        return projects;
    }
}
