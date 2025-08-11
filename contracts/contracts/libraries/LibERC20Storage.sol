//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library LibERC20Storage {
    bytes32 constant ERC20_STORAGE_POSITION =
        keccak256('diamond.storage.ERC20Storage.v1');

    struct ERC20Data {
        uint256 totalSupply;
        string name;
        string symbol;
        uint8 decimals;
        mapping(address => uint256) balances;
        mapping(address => mapping(address => uint256)) allowances;
    }

    function ERC20Storage() internal pure returns (ERC20Data storage td) {
        bytes32 position = ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            td.slot := position
        }
    }
}