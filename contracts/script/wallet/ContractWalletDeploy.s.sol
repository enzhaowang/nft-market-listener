// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {ContractWallet} from "../../src/wallet/ContractWallet.sol";
import "forge-std/console.sol";

contract DeployContractWallet is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        // 方法1：直接初始化数组
        address[] memory owners = new address[](3);
        owners[0] = 0x678F7fb42BcC819285EfE21fDA421E67B2F45839; //account1
        owners[1] = 0xC3637C58e72D5f4A8570D3b86D6875F1eC5fAa3B; //account2
        owners[2] = 0xc605Cf9deD6e1f5e3D90CDB2f4E4D37E647Ac808; //account5

 

        ContractWallet wallet = new ContractWallet(owners, 2);

        console.log("ContractWallet deployed at:", address(wallet));

        vm.stopBroadcast();
    }
}