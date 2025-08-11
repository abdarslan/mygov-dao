//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDonation {
        event TokensDonated(
        address indexed donor,
        address indexed token,
        uint amount
    );
    function donateMyGovToken(uint amount) external;
    function donateTLToken(uint amount) external;
}