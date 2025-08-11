//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibGovStorage} from "./LibGovStorage.sol";
import {IERC20} from "../interfaces/IERC20.sol";

library LibMemberUtil {
    event MembershipChanged(
        address indexed member,
        bool isMember,
        uint totalMembers
    );

    function onlyMember() internal{
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        // Access myGovToken balance by calling the diamond's ERC20 balanceOf function
        if (IERC20(address(this)).balanceOf(msg.sender) == 0) {
            if (gs.isMember[msg.sender]) {
                // Check if they *were* a member
                gs.isMember[msg.sender] = false;
                if (gs.members > 0) {
                    // Prevent underflow
                    gs.members--;
                }
                emit MembershipChanged(msg.sender, false, gs.members);
            }
            revert(
                "GovFacet: Caller is not a member (zero MyGovToken balance)"
            );
        }
        if (!gs.isMember[msg.sender]) {
            gs.isMember[msg.sender] = true;
            gs.members++;
            emit MembershipChanged(msg.sender, true, gs.members);
        }
    }
    function isProjectActive(uint projectid) internal returns (bool) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        if (projectid >= gs.projects.length) return false; // Project doesn't exist
        LibGovStorage.Project storage project = gs.projects[projectid];

        if (project.completed) return false;

        if (!project.beingFunded) {
            if (
                project.votedeadline < block.timestamp &&
                (project.payschedule.length == 0 ||
                    block.timestamp > project.payschedule[0])
            ) {
                project.completed = true;
                return false;
            }
        } else {
            uint paymentIndex = project.payschedule.length;
            for (uint k = 0; k < project.paymentamounts.length; k++) {
                if (project.paymentamounts[k] != 0) {
                    paymentIndex = k;
                    break; // Found the first non-zero payment amount
                }
            }
            if (
                paymentIndex < project.payschedule.length &&
                project.payschedule[paymentIndex] < block.timestamp
            ) {
                bool allPaymentsDone = true;
                for (uint i = 0; i < project.paymentamounts.length; i++) {
                    if (project.paymentamounts[i] != 0) {
                        allPaymentsDone = false;
                        break;
                    }
                }
                if (!allPaymentsDone) {
                    project.completed = true;
                    return false;
                }
            }
        }
        return true;
    }

    function memberActivityCheck(address user) internal returns (uint) {
        // changed to view
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        for (uint i = 0; i < gs.numOfProjects; i++) {
            // Use numOfProjects from storage
            if (i >= gs.projects.length) break; // Safety break
            LibGovStorage.Project storage project = gs.projects[i];
            uint cycleIndex = project.paymentamounts.length; // Default to length
            for (uint k = 0; k < project.paymentamounts.length; k++) {
                if (project.paymentamounts[k] != 0) {
                    cycleIndex = k;
                    break; // Found the first non-zero payment amount
                }
            }
            if (
                (project.voted[user] ||
                    project.votedPaymentPerCycle[cycleIndex][user] ||
                    project.delegateTo[user] != address(0)) &&
                isProjectActive(i)
            ) {
                return 1;
            }
        }
        return 0; // Return 0 if no blocking activity, otherwise revert handled it
    }

}
