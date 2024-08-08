
/*
 ___       ___  ___     ___    ___
|\  \     |\  \|\  \   |\  \  /  /|
\ \  \    \ \  \\\  \  \ \  \/  / |
 \ \  \    \ \  \\\  \  \ \    / /
  \ \  \____\ \  \\\  \  /     \/
   \ \_______\ \_______\/  /\   \
    \|_______|\|_______/__/ /\ __\
                       |__|/ \|__|


*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20B.sol";

contract LUXD is ERC20B {
    string public constant _name = 'Lux Dollar';
    string public constant _symbol = 'LUXD';
    constructor() ERC20B(_name, _symbol) {}
}

