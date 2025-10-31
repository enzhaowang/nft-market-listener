// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract MyNFT is ERC721URIStorage {
    uint256 private _tokenId;

    constructor() ERC721("MyNFT", "MN") {}
    



    function mintNFT(address to, string memory tokenURI)
        public
        returns (uint256)
    {
        uint256 newItemId = _tokenId;
        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tokenId++;
        return newItemId;
    }

    
}