/**
 *Submitted for verification at basescan.org on 2024-03-20
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ERC20B is ERC20, Ownable, AccessControl {
    event BridgeMint(address indexed account, uint amount);
    event BridgeBurn(address indexed account, uint amount);
    event AdminGranted(address to);
    event AdminRevoked(address to);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {
        grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Ownable: caller is not the owner or admin");
        _;
    }

    function grantAdmin(address to) public onlyAdmin {
        grantRole(DEFAULT_ADMIN_ROLE, to);
        emit AdminGranted(to);
    }

    function revokeAdmin(address to) public onlyAdmin {
        require(hasRole(DEFAULT_ADMIN_ROLE, to), "Ownable");
        revokeRole(DEFAULT_ADMIN_ROLE, to);
        emit AdminRevoked(to);
    }

    function bridgeMint(address account, uint256 amount) public onlyAdmin returns (bool) {
        _mint(account, amount);
        emit BridgeMint(account, amount);
        return true;
    }

    function bridgeBurn(address account, uint256 amount) public onlyAdmin returns (bool) {
        _burn(account, amount);
        emit BridgeBurn(account, amount);
        return true;
    }
}
