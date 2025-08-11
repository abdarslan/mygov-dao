//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGov {
    event ProjectSubmitted(uint indexed projectId, address indexed owner, string weburl);
    event Voted(uint indexed projectId, address indexed voter, bool choice, bool forPayment);
    event ProjectGrantReserved(uint indexed projectId);
    event ProjectPaymentWithdrawn(uint indexed projectId, address indexed recipient, uint amount);
    event MembershipChanged(address indexed user, bool isMember, uint memberCount);
    event DelegateSet(uint indexed projectId, address indexed delegator, address indexed delegatee);
    function voteForProjectProposal(uint projectid, bool choice) external;
    function voteForProjectPayment(uint projectid, bool choice) external;
    function submitProjectProposal(
        string memory weburl,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule
    ) external returns (uint projectid);
    function reserveProjectGrant(uint projectid) external;
    function withdrawProjectTLPayment(uint projectid) external;
    function delegateVoteTo(address memberaddr, uint projectid) external;
}