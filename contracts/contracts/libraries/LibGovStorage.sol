// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library LibGovStorage {
    bytes32 constant GOV_STORAGE_POSITION =
        keccak256('diamond.storage.GovStorage.v1');

    struct Project {    // project struct
        uint projectid;
        address projectowner;
        string weburl;
        uint votedeadline;
        uint[] paymentamounts;
        uint[] payschedule;
        bool completed;     // if project is completed or not. It includes termination cases as well
        uint numOfVotesYes;
        uint numOfVotesNo;
        uint numOfVotesYesPayment;
        uint numOfVotesNoPayment;
        bool beingFunded;   // it is true if project is reserved by owner succesfully
        uint tlreceived;
        bool eligibleForPayment;    // it is status of vote ratio for payment, updataed at every vote action
        uint totalPayment;
        mapping(address => bool) voted; // mapping of addresses that have voted 
        mapping(uint => mapping(address => bool)) votedPaymentPerCycle; // mapping of addresses that have voted for payment
        mapping(address => address) delegateTo; // mapping of addresses that have delegated their vote to another address
        mapping(address => uint) voteWeight; // mapping of addresses that have delegated their vote to another address
    }

    struct GovData {
        address tlToken;
        address contractOwner;
        mapping(address => bool) usedFaucet;
        Project[] projects;
        mapping(address => bool) isMember;
        uint members;
        uint numOfProjects;
        uint reservedTotal;
        uint numOfFundedProjects;
    }

    function GovStorage() internal pure returns (GovData storage md)  {
        bytes32 position = GOV_STORAGE_POSITION ;
        assembly {
            md.slot := position
        }
    }
}