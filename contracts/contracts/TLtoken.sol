pragma solidity ^0.8.20;
// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TLToken is ERC20 {
address owner;
constructor() ERC20("TL Token", "TL") {
owner = msg.sender;
}
function mint(address to, uint amount) public {
require(msg.sender == owner,"Only owner can mint tokens");
_mint(to, amount);
}
}