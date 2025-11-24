// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import {Script} from "forge-std/Script.sol";
import {MyERC20} from "../src/MyERC20.sol";


contract MyERC20Deploy is Script{

    function run() public {
        vm.startBroadcast(vm.envUint("ANVIL_PRIVATE_KEY"));

        new MyERC20(1000 * 10 ** 18);

        vm.stopBroadcast();
    }

}