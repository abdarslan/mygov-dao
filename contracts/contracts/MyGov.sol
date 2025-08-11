pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED

import './diamond/Diamond.sol';

contract MyGov is Diamond {
    constructor(
        address _contractOwner,
        address _diamondCutFacet
    ) payable Diamond(_contractOwner, _diamondCutFacet) {}
}
