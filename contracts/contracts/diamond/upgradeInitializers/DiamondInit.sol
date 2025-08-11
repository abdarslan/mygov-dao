// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {IDiamondLoupe} from "../interfaces/IDiamondLoupe.sol";
import {IDiamondCut} from "../interfaces/IDiamondCut.sol";
import {IERC173} from "../interfaces/IERC173.sol";
import {IERC165} from "../interfaces/IERC165.sol";
import {LibERC20Storage} from "../../libraries/LibERC20Storage.sol";
import {LibGovStorage} from "../../libraries/LibGovStorage.sol";
import {LibSurveyStorage} from "../../libraries/LibSurveyStorage.sol";

// It is expected that this contract is customized if you want to deploy your diamond
// with data from a deployment script. Use the init function to initialize state variables
// of your diamond. Add parameters to the init function if you need to.

contract DiamondInit {
    // You can add parameters to this function in order to pass in
    // data to set your own state variables
    event Transfer(address indexed from, address indexed to, uint256 value);

    function init() internal {
        // adding ERC165 data
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds.supportedInterfaces[type(IERC173).interfaceId] = true;

        // add your own state variables
        // EIP-2535 specifies that the `diamondCut` function takes two optional
        // arguments: address _init and bytes calldata _calldata
        // These arguments are used to execute an arbitrary function using delegatecall
        // in order to set state variables in the diamond during deployment or an upgrade
        // More info here: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface
    }

    function initERC20(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) internal {
        LibERC20Storage.ERC20Data storage es = LibERC20Storage.ERC20Storage();

        es.name = _name;
        es.symbol = _symbol;
        es.decimals = _decimals;

        uint256 adjustedSupply = _initialSupply * 10 ** uint256(_decimals);
        es.totalSupply = adjustedSupply;

        es.balances[address(this)] = adjustedSupply; // Mint to Diamond itself

        emit Transfer(address(0), address(this), adjustedSupply);
    }

    function initGov(address _owner, address _tlToken) internal {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        gs.contractOwner = _owner;
        gs.tlToken = _tlToken;
    }

    function initSurvey(address _tlToken) internal {
        LibSurveyStorage.SurveyData storage ss = LibSurveyStorage
            .SurveyStorage();
        ss.tlToken = _tlToken;
    }
    function initAll(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _owner,
        address _tlToken
    ) external {
        init();
        initERC20(_name, _symbol, _decimals, _initialSupply);
        initGov(_owner, _tlToken);
        initSurvey(_tlToken);
    }
}
