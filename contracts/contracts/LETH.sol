/**
 *Submitted for verification at basescan.org on 2024-03-20
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20B.sol";


/* __                      ____    ______  __  __
/\ \                    /\  _`\ /\__  _\/\ \/\ \
\ \ \      __  __  __  _\ \ \L\_\/_/\ \/\ \ \_\ \
 \ \ \  __/\ \/\ \/\ \/'\\ \  _\L  \ \ \ \ \  _  \
  \ \ \L\ \ \ \_\ \/>  </ \ \ \L\ \ \ \ \ \ \ \ \ \
   \ \____/\ \____//\_/\_\ \ \____/  \ \_\ \ \_\ \_\
    \/___/  \/___/ \//\/_/  \/___/    \/_/  \/_/\/_/
*/

contract LuxETH is ERC20B {

    string public constant _name = 'LuxETH';
    string public constant _symbol = 'LETH';

    constructor() ERC20B(_name, _symbol) {}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }

}
