// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IExtendedERC20 is IERC20 {
    function transferWithCallback(address _to, uint256 _amount) external returns (bool);
    function transferWithCallbackAndData(address _to, uint256 _amount, bytes calldata _data) external returns (bool);

}