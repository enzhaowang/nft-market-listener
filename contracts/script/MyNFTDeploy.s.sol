// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import {Script} from "forge-std/Script.sol";
import {MyNFT} from "../src/MyNFT.sol";


contract MyNFTDeploy is Script{

    function run() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        new MyNFT();

        vm.stopBroadcast();
    }

}