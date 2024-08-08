/**
 *Submitted for verification at basescan.org on 2024-03-20
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20B.sol";


/*
 __                      ____    ______  ____
/\ \                    /\  _`\ /\__  _\/\  _`\
\ \ \      __  __  __  _\ \ \L\ \/_/\ \/\ \ \/\_\
 \ \ \  __/\ \/\ \/\ \/'\\ \  _ <' \ \ \ \ \ \/_/_
  \ \ \L\ \ \ \_\ \/>  </ \ \ \L\ \ \ \ \ \ \ \L\ \
   \ \____/\ \____//\_/\_\ \ \____/  \ \_\ \ \____/
    \/___/  \/___/ \//\/_/  \/___/    \/_/  \/___/
*/

contract LuxBTC is ERC20B {

    string public constant _name = 'LuxBTC';
    string public constant _symbol = 'LBTC';

    constructor() ERC20B(_name, _symbol) {

    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }

}
