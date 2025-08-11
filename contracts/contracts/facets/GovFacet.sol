// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../interfaces/IERC20.sol";
import {LibGovStorage} from "../libraries/LibGovStorage.sol";
import {LibMemberUtil} from "../libraries/LibMemberUtil.sol";
import {IGov} from "../interfaces/IGov.sol";

contract GovFacet is IGov {
    // GovFacet specific events (add others as needed from original contract if any were missed

    modifier onlyOwner() {
        require(msg.sender == LibGovStorage.GovStorage().contractOwner, "GovFacet: Caller is not the contract owner");
        _;
    }

    modifier onlyMember() {
        LibMemberUtil.onlyMember(); // Use the utility modifier to check membership
        _;
    }

    modifier onlyProjectOwner(uint projectId) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        require(projectId < gs.projects.length, "GovFacet: Project doesn't exist");
        require(msg.sender == gs.projects[projectId].projectowner, "GovFacet: Caller is not the project owner");
        _;
    }

    modifier onlyActiveProject(uint projectId) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        require(projectId < gs.projects.length, "GovFacet: Project doesn't exist");
        LibGovStorage.Project storage project = gs.projects[projectId];
        require(!project.completed, "GovFacet: Project already completed");

        string memory reason = "";
        bool doRevert = false;

        if (!project.beingFunded) {
            if (project.votedeadline < block.timestamp && 
                (project.payschedule.length == 0 || block.timestamp > project.payschedule[0])) { // Handle empty payschedule
                project.completed = true;
                reason = "GovFacet: Project not reserved on time and payment overdue";
                doRevert = true;
            }
        } else {
            uint paymentIndex = _nextPaymentIndex(projectId);
            if (paymentIndex < project.payschedule.length && project.payschedule[paymentIndex] < block.timestamp) {
                // Check if all payments are done or if overdue
                bool allPaymentsDone = true;
                for(uint i=0; i < project.paymentamounts.length; i++){
                    if(project.paymentamounts[i] != 0) {
                        allPaymentsDone = false;
                        break;
                    }
                }
                if(!allPaymentsDone){ // Only revert if overdue AND not all payments done
                    project.completed = true;
                    reason = "GovFacet: Project payment overdue";
                    doRevert = true;
                }
            }
        }
        if (doRevert) {
             revert(reason);
        }
        _;
    }

    function _nextPaymentIndex(uint projectId) internal view returns (uint paymentIndex) {
        LibGovStorage.Project storage project = LibGovStorage.GovStorage().projects[projectId];
        for (uint i = 0; i < project.paymentamounts.length; i++) {
            if (project.paymentamounts[i] != 0) {
                return i;
            }
        }
        return project.paymentamounts.length; // Indicates all prior payments made or no payments
    }

    function findDelegate(address memberaddr, uint projectid) internal view returns (address) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        require(projectid < gs.projects.length, "GovFacet: Project ID out of bounds");
        require(gs.projects[projectid].projectowner != address(0), "GovFacet: Project doesn't exist");
        
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        address current = memberaddr;
        // Added a reasonable loop bound to prevent infinite loops in case of cycles (though logic should prevent it)
        for(uint i=0; i < gs.members + 1 && tempProject.delegateTo[current] != address(0) && tempProject.delegateTo[current] != msg.sender; i++) {
            current = tempProject.delegateTo[current];
        }
        return current;
    }

    function delegateVoteTo(address memberaddr, uint projectid) external onlyMember onlyActiveProject(projectid) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];

        require(tempProject.projectowner != memberaddr, "GovFacet: Cannot delegate to project owner");
        require(!tempProject.voted[msg.sender], "GovFacet: Already voted, cannot delegate");
        require(tempProject.delegateTo[msg.sender] == address(0), "GovFacet: Already delegated vote for this project");
        
        // Ensure delegatee is a member (or becomes one if they hold tokens)
        if (IERC20(address(this)).balanceOf(memberaddr) > 0 && !gs.isMember[memberaddr]) {
            gs.isMember[memberaddr] = true;
            gs.members++;
            emit MembershipChanged(memberaddr, true, gs.members);
        }
        require(gs.isMember[memberaddr], "GovFacet: Delegatee is not a member");
        require(!tempProject.voted[memberaddr], "GovFacet: Delegatee has already voted");

        address finalDelegate = findDelegate(memberaddr, projectid);
        require(finalDelegate != msg.sender, "GovFacet: Cannot delegate to self through a chain");

        tempProject.delegateTo[msg.sender] = finalDelegate;
        tempProject.voteWeight[finalDelegate] += (tempProject.voteWeight[msg.sender] == 0 ? 1 : tempProject.voteWeight[msg.sender]); 
        tempProject.voteWeight[msg.sender] = 0; // Their direct voting power is now delegated

        emit DelegateSet(projectid, msg.sender, finalDelegate);
    }

    function memberActivityCheck(address user) internal returns (uint) { 
        return LibMemberUtil.memberActivityCheck(user);
    }
    function voteForProjectProposal(uint projectid, bool choice) external onlyMember onlyActiveProject(projectid) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];

        require(msg.sender != tempProject.projectowner, "GovFacet: Project owner cannot vote on proposal");
        require(tempProject.votedeadline >= block.timestamp, "GovFacet: Proposal vote deadline has passed");
        require(tempProject.delegateTo[msg.sender] == address(0),"GovFacet: Vote has been delegated for this project");
        require(!tempProject.voted[msg.sender], "GovFacet: Already voted on proposal");

        tempProject.voted[msg.sender] = true;
        uint effectiveVotes = (tempProject.voteWeight[msg.sender] == 0 ? 1 : tempProject.voteWeight[msg.sender] + 1);

        if (choice) {
            tempProject.numOfVotesYes += effectiveVotes;
        } else {
            tempProject.numOfVotesNo += effectiveVotes;
        }
        emit Voted(projectid, msg.sender, choice, false);
    }

    function voteForProjectPayment(uint projectid, bool choice) external onlyMember onlyActiveProject(projectid) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage project = gs.projects[projectid];
        uint paymentIndex = _nextPaymentIndex(projectid);
        require(project.beingFunded, "GovFacet: Project is not being funded");
        require(msg.sender != project.projectowner, "GovFacet: Project owner cannot vote on payment");
        require(!project.votedPaymentPerCycle[paymentIndex][msg.sender], "GovFacet: Already voted on payment");
        require(project.delegateTo[msg.sender] == address(0), "GovFacet: Vote has been delegated for this project");
        
        project.votedPaymentPerCycle[paymentIndex][msg.sender] = true;
        uint effectiveVotes = (project.voteWeight[msg.sender] == 0 ? 1 : project.voteWeight[msg.sender] + 1);

        if (choice) {
            project.numOfVotesYesPayment += effectiveVotes;
            if (project.numOfVotesYesPayment * 100 >= gs.members) {
                project.eligibleForPayment = true;
            }
        } else {
            project.numOfVotesNoPayment += effectiveVotes;
            if (project.numOfVotesYesPayment * 100 < gs.members) { 
                project.eligibleForPayment = false;
            }
        }
        emit Voted(projectid, msg.sender, choice, true);
    }

    function submitProjectProposal(
        string memory weburl,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule
    ) external onlyMember returns (uint projectid) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        IERC20 externalToken = IERC20(gs.tlToken);
        IERC20 myGov = IERC20(address(this));

        // Costs for submitting a project
        uint tlTokenCost = 4000;// Adjust for actual decimals
        uint myGovTokenCost = 5;       // Adjust for actual decimals

        uint isActive = memberActivityCheck(msg.sender); // Will return 0 if no blocking activity, otherwise 1

        require(externalToken.balanceOf(msg.sender) >= tlTokenCost, "GovFacet: Insufficient TLToken balance");
        require(myGov.balanceOf(msg.sender) >= myGovTokenCost + isActive, "GovFacet: Insufficient MyGovToken balance");
        
        require(externalToken.allowance(msg.sender, address(this)) >= tlTokenCost, "GovFacet: TLToken allowance insufficient");
        require(myGov.allowance(msg.sender, address(this)) >= myGovTokenCost, "GovFacet: MyGovToken allowance insufficient");

        require(externalToken.transferFrom(msg.sender, address(this), tlTokenCost), "GovFacet: TLToken transfer failed");
        require(myGov.transferFrom(msg.sender, address(this), myGovTokenCost), "GovFacet: MyGovToken transfer failed");

        gs.numOfProjects++;
        gs.projects.push();
        LibGovStorage.Project storage newProject = gs.projects[gs.projects.length - 1]; // Use projects.length

        newProject.projectid = gs.projects.length - 1;
        newProject.projectowner = msg.sender;
        newProject.weburl = weburl;
        newProject.votedeadline = votedeadline;
        newProject.paymentamounts = paymentamounts;
        newProject.payschedule = payschedule;
        newProject.completed = false;
        newProject.beingFunded = false;
        newProject.eligibleForPayment = false; // Start as not eligible

        for (uint i = 0; i < paymentamounts.length; i++) {
            newProject.totalPayment += paymentamounts[i];
        }
        emit ProjectSubmitted(newProject.projectid, msg.sender, weburl);
        return newProject.projectid;
    }

    function reserveProjectGrant(uint projectid) external onlyProjectOwner(projectid) onlyActiveProject(projectid) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage project = gs.projects[projectid];
        IERC20 externalToken = IERC20(gs.tlToken);

        require(!project.beingFunded, "GovFacet: Project grant already reserved");
        require(project.votedeadline < block.timestamp, "GovFacet: Vote deadline has not passed yet");
        // Check if vote was successful (example: more yes than no, or specific quorum)
        require(project.numOfVotesYes > project.numOfVotesNo, "GovFacet: Project proposal vote not successful"); // Add your own success criteria

        require(externalToken.balanceOf(address(this)) - gs.reservedTotal >= project.totalPayment, "GovFacet: Insufficient TLToken in contract for grant reservation");
        
        project.beingFunded = true;
        gs.numOfFundedProjects++;
        gs.reservedTotal += project.totalPayment;
        emit ProjectGrantReserved(projectid);
    }

    function withdrawProjectTLPayment(uint projectid) external onlyProjectOwner(projectid) onlyActiveProject(projectid) {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        LibGovStorage.Project storage tempProject = gs.projects[projectid];
        IERC20 externalToken = IERC20(gs.tlToken);

        require(tempProject.beingFunded, "GovFacet: Project is not being funded");
        require(tempProject.eligibleForPayment, "GovFacet: Project not eligible for payment based on votes");
        
        uint paymentIndex = _nextPaymentIndex(projectid);
        require(paymentIndex < tempProject.payschedule.length, "GovFacet: No pending payments or payment schedule exhausted");
        require(tempProject.payschedule[paymentIndex] <= block.timestamp, "GovFacet: Not payment time yet for the current installment"); // Changed to <=

        uint paymentAmount = tempProject.paymentamounts[paymentIndex];
        require(paymentAmount > 0, "GovFacet: Payment amount is zero (already paid or error)");
        require(externalToken.balanceOf(address(this)) >= paymentAmount, "GovFacet: Insufficient TLToken in contract for this payment");

        require(externalToken.transfer(msg.sender, paymentAmount), "GovFacet: TLToken transfer for payment failed");
        
        tempProject.tlreceived += paymentAmount;
        gs.reservedTotal -= paymentAmount; // Reduce reserved total as payment is made
        tempProject.paymentamounts[paymentIndex] = 0; // Mark this installment as paid

        // Reset payment voting for next installment if any (or keep eligibility)
        tempProject.eligibleForPayment = false; // Require re-voting for next payment
        tempProject.numOfVotesYesPayment = 0;
        tempProject.numOfVotesNoPayment = 0;

        bool allPaymentsDone = true;
        for(uint i=0; i < tempProject.paymentamounts.length; i++){
            if(tempProject.paymentamounts[i] != 0) {
                allPaymentsDone = false;
                break;
            }
        }

        if (allPaymentsDone) {
            tempProject.completed = true;
            tempProject.beingFunded = false; // No longer actively being funded if all payments made
            if (gs.numOfFundedProjects > 0) gs.numOfFundedProjects--;
        }
        emit ProjectPaymentWithdrawn(projectid, msg.sender, paymentAmount);
    }
}