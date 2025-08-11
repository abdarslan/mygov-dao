// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LibERC20Storage as ES} from "../libraries/LibERC20Storage.sol";
import {IERC20} from "../interfaces/IERC20.sol";
import {LibGovStorage} from "../libraries/LibGovStorage.sol";

contract ERC20Facet is IERC20 {

    function name() external view returns (string memory) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        return es.name;
    }

    function symbol() external view returns (string memory) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        return es.symbol;
    }

    function decimals() external view returns (uint8) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        return es.decimals;
    }

    function balanceOf(address account) external view returns (uint256) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        return es.balances[account];
    }

    function totalSupply() external view returns (uint256) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        return es.totalSupply;
    }

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        return es.allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        es.allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        require(
            es.balances[msg.sender] >= amount,
            "ERC20: insufficient balance"
        );
        es.balances[msg.sender] -= amount;
        es.balances[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        ES.ERC20Data storage es = ES.ERC20Storage();
        require(es.balances[sender] >= amount, "ERC20: insufficient balance");
        require(
            es.allowances[sender][msg.sender] >= amount,
            "ERC20: insufficient allowance"
        );

        es.balances[sender] -= amount;
        es.balances[recipient] += amount;
        es.allowances[sender][msg.sender] -= amount;

        emit Transfer(sender, recipient, amount);
        emit Approval(sender, msg.sender, es.allowances[sender][msg.sender]);
        return true;
    }

    function sendTokens(address to, uint256 amount) external {
        require(
            msg.sender == LibGovStorage.GovStorage().contractOwner,
            "Only owner can send tokens"
        );

        ES.ERC20Data storage es = ES.ERC20Storage();

        require(
            es.balances[address(this)] >= amount,
            "Not enough tokens in contract"
        );

        es.balances[address(this)] -= amount;
        es.balances[to] += amount;

        emit Transfer(address(this), to, amount);
    }

    function faucet() external {
        LibGovStorage.GovData storage gs = LibGovStorage.GovStorage();
        require(!gs.usedFaucet[msg.sender], "GovFacet: Faucet already used");
        // Assumes the diamond contract (address(this)) holds MyGovTokens for the faucet
        require(
            IERC20(address(this)).balanceOf(address(this)) >= 1,
            "GovFacet: Faucet has insufficient MyGovToken balance"
        ); // Assuming 1 token = 1 ether in decimals

        // Call diamond's transfer function to send MyGovToken
        bool success = IERC20(address(this)).transfer(msg.sender, 1); // Adjust amount as needed
        require(success, "GovFacet: MyGovToken transfer failed from faucet");

        gs.usedFaucet[msg.sender] = true;
        if (!gs.isMember[msg.sender]) {
            gs.isMember[msg.sender] = true;
            gs.members++;
            emit MembershipChanged(msg.sender, true, gs.members);
        }
        emit FaucetUsed(msg.sender);
    }
}
