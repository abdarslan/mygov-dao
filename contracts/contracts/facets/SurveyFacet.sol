//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LibSurveyStorage} from "../libraries/LibSurveyStorage.sol";
import {ISurvey} from "../interfaces/ISurvey.sol";
import {LibMemberUtil} from "../libraries/LibMemberUtil.sol";
import {IERC20} from "../interfaces/IERC20.sol";

contract SurveyFacet is ISurvey {

    modifier onlyMember() {
        LibMemberUtil.onlyMember();
        _;
    }

    function memberActivityCheck(address user) internal returns (uint) {
        return LibMemberUtil.memberActivityCheck(user); // Use the utility function to check activity
    }

    function submitSurvey(
        string memory weburl,
        uint surveydeadline,
        uint numchoices,
        uint atmostchoice
    ) external onlyMember returns (uint surveyid) {
        LibSurveyStorage.SurveyData storage ss = LibSurveyStorage
            .SurveyStorage();
        IERC20 externalToken = IERC20(ss.tlToken);
        IERC20 myGov = IERC20(address(this));

        // Costs for submitting a project
        uint tlTokenCost = 1000; // Adjust for actual decimals
        uint myGovTokenCost = 2; // Adjust for actual decimals

        require(
            externalToken.balanceOf(msg.sender) >= tlTokenCost,
            "balance < amount"
        );
        require(
            myGov.balanceOf(msg.sender) >= myGovTokenCost + memberActivityCheck(msg.sender),
            "balance < amount"
        );
        require(
            externalToken.allowance(msg.sender, address(this)) >= tlTokenCost,
            "allowance < amount"
        );
        require(
            myGov.allowance(msg.sender, address(this)) >= myGovTokenCost,
            "allowance < amount"
        );
        require(
            externalToken.transferFrom(msg.sender, address(this), tlTokenCost),
            "Transfer failed"
        );
        require(
            myGov.transferFrom(msg.sender, address(this), myGovTokenCost),
            "Transfer failed"
        );
        ss.numOfSurveys++;
        ss.surveys.push();
        LibSurveyStorage.Survey storage newSurvey = ss.surveys[
            ss.numOfSurveys - 1
        ];
        newSurvey.surveyid = ss.numOfSurveys - 1;
        newSurvey.weburl = weburl;
        newSurvey.surveydeadline = surveydeadline;
        newSurvey.numchoices = numchoices;
        newSurvey.atmostchoice = atmostchoice;
        newSurvey.surveyowner = msg.sender;
        newSurvey.numtaken = 0;
        surveyid = newSurvey.surveyid;
        emit SurveySubmitted(
            surveyid,
            msg.sender
        );
        return surveyid;
    }

    function takeSurvey(
        uint surveyid,
        uint[] memory choices
    ) external onlyMember {
        LibSurveyStorage.SurveyData storage ss = LibSurveyStorage
            .SurveyStorage();
        LibSurveyStorage.Survey storage tempSurvey = ss.surveys[surveyid];

        require(tempSurvey.surveyowner != address(0), "no such survey");
        require(
            tempSurvey.surveydeadline > block.timestamp,
            "deadline has passed"
        );
        require(tempSurvey.atmostchoice >= choices.length, "too many choices");
        tempSurvey.numtaken++;
        for (uint i = 0; i < choices.length; i++) {
            //check if tempSurvey.results[choices[i]] exist if its not push until it exists
            while (tempSurvey.results.length <= choices[i]) {
                tempSurvey.results.push(0);
            }
            tempSurvey.results[choices[i]] += 1;
        }
    }
}
