//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleDistributor {
    bytes32 public immutable merkleRoot;

    event Claimed(address account, uint256 amount);

    constructor(bytes32 merkleRoot_) {
        merkleRoot = merkleRoot_;
    }

    function claim (
        address account,
        uint256 amount,
        bytes32[] calldata proof
    ) public {
        require(account != address(0), "address shoule not be 0");
        require(amount > 0, "amount should larger than 0");

        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "merkledistrubtor:  invalid proof ");

        emit Claimed(account, amount);
    

    }

}