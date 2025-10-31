// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface ITokenReceiver {
    function tokenReceived(address from, uint256 amount, bytes calldata data) external returns (bool);
}
