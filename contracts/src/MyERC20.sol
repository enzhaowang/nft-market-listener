// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ITokenReceiver} from "./interfaces/ItokenReceiver.sol";

contract MyERC20 is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyERC20", "MYERC20") {
        _mint(msg.sender, initialSupply);
    }

    function transferWithCallbackAndData(address _to, uint256 _amount, bytes calldata data) external returns (bool) {
        transfer(_to, _amount);

        if (_to.code.length > 0) {
            try ITokenReceiver(_to).tokenReceived(msg.sender, _amount, data) returns (bool success) {
                return success;
            } catch {
                revert();
            }
        }

        return true;
    }
}
