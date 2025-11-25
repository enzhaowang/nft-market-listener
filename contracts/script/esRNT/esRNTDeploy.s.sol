// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import {Script} from "forge-std/Script.sol";
import {esRNT} from "../../src/esRNT/esRNT.sol";




contract esRNTDeploy is Script{

    function run() public {
        vm.startBroadcast(vm.envUint("ANVIL_PRIVATE_KEY"));

        new esRNT();

        vm.stopBroadcast();
    }

}