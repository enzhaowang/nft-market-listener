// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.3;

import {Script} from "forge-std/Script.sol";
import {NFTMarket} from "../src/NFTMarket.sol";

contract NFTMarketDeploy is Script {


    function run() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        new NFTMarket(address(0xD6E941AdC2622698FC9ca1767aa357D82c8B3381));

        vm.stopBroadcast();
    }

    

}
