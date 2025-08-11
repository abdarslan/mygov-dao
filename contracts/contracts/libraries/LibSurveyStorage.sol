//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library LibSurveyStorage {
    bytes32 constant SURVEY_STORAGE_POSITION = keccak256("diamond.storage.SurveyStorage.v1");

    struct Survey {
        uint surveyid;
        string weburl;
        uint surveydeadline;
        uint numchoices;
        uint atmostchoice;
        address surveyowner;
        uint numtaken;
        uint[] results; // number of votes for each choice
    }

    struct SurveyData {
        Survey[] surveys;
        uint numOfSurveys;
        address tlToken;
    }

    function SurveyStorage() internal pure returns (SurveyData storage sd) {
        bytes32 position = SURVEY_STORAGE_POSITION;
        assembly {
            sd.slot := position
        }
    }
}
