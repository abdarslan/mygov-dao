//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibDonationStorage} from "../libraries/LibDonationStorage.sol";
import {IDonation} from "../interfaces/IDonation.sol";
import {LibGovStorage} from "../libraries/LibGovStorage.sol";
import {IERC20} from "../interfaces/IERC20.sol";
import {LibMemberUtil} from "../libraries/LibMemberUtil.sol";

contract DonationFacet is IDonation {

    function memberActivityCheck(address user) internal returns (uint) {
        return LibMemberUtil.memberActivityCheck(user); // Use the utility function to check activity
    }

    function donateTLToken(uint amount) external {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        IERC20 externalToken = IERC20(gs.tlToken);

        require(
            externalToken.balanceOf(msg.sender) >= amount,
            "DonationFacet: TLToken balance insufficient"
        );
        require(
            externalToken.allowance(msg.sender, address(this)) >= amount,
            "DonationFacet: TLToken allowance insufficient"
        );
        require(
            externalToken.transferFrom(msg.sender, address(this), amount),
            "DonationFacet: TLToken transfer failed"
        );
        // Update the donation storage
        LibDonationStorage.DonationData storage dd = LibDonationStorage
            .DonationStorage();
        dd.totalTLDonations += amount;
        dd.donorsTL[msg.sender] += amount;
        emit TokensDonated(msg.sender, gs.tlToken, amount);
    }

    function donateMyGovToken(uint amount) external {
        uint isActive = memberActivityCheck(msg.sender); // This will return 0 if no blocking activity, otherwise 1

        require(
            IERC20(address(this)).balanceOf(msg.sender) >= amount + isActive,
            "DonationFacet: MyGovToken balance insufficient for donation amount"
        );
        // `allowance` and `transferFrom` are correctly targeting `address(this)` for MyGovToken (diamond's ERC20)
        require(
            IERC20(address(this)).allowance(msg.sender, address(this)) >=
                amount,
            "DonationFacet: MyGovToken allowance insufficient"
        );
        bool success = IERC20(address(this)).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "DonationFacet: MyGovToken transferFrom failed");
        // Update the donation storage
        LibDonationStorage.DonationData storage dd = LibDonationStorage
            .DonationStorage();
        dd.totalMyGovDonations += amount;
        dd.donorsMyGov[msg.sender] += amount;
        emit TokensDonated(msg.sender, address(this), amount);
    }
}
