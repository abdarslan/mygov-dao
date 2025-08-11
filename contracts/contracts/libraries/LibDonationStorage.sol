//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library LibDonationStorage {
    bytes32 constant DONATION_STORAGE_POSITION =
        keccak256('diamond.storage.DonationStorage.v1');

    struct DonationData {
        uint256 totalTLDonations;
        uint256 totalMyGovDonations;
        mapping(address => uint256) donorsTL;
        mapping(address => uint256) donorsMyGov;
    }

    function DonationStorage() internal pure returns (DonationData storage td) {
        bytes32 position = DONATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            td.slot := position
        }
    }
}