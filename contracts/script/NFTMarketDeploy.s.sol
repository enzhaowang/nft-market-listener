// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.3;

import {Script} from "forge-std/Script.sol";
import {NFTMarket} from "../src/NFTMarket.sol";

contract NFTMarketDeploy is Script {


    function run() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        new NFTMarket(address(0x5FbDB2315678afecb367f032d93F642f64180aa3));

        vm.stopBroadcast();
    }

    

}
