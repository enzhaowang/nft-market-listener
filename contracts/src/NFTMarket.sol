pragma solidity ^0.8.3;


import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ITokenReceiver} from "./interfaces/ItokenReceiver.sol";
import {IExtendedERC20} from "./interfaces/IExtendedERC20.sol";
import {console} from "forge-std/Test.sol";




contract NFTMarket is ITokenReceiver {
    //ERC20 token
    IExtendedERC20 public paymentToken;

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    //events
    event NFTListed(uint256 indexed listingId, address seller, address nftContract, uint256 tokenId, uint256 price);
    event NFTSold(uint256 indexed listingId, address seller, address indexed buyer, address nftContract, uint256 tokenId, uint256 price);
    event NFTListingCalcelled(uint256 indexed listingId);

    //constructor
    constructor(address _paymentToken) {
        require(_paymentToken != address(0), "NFTMarket: payment token can not be zero");
        paymentToken = IExtendedERC20(_paymentToken);
    }

    //list NFT
    function list(address _nftContract, uint256 _price, uint256 _tokenId) external returns(uint256) {
        //check if price bigger than 0 
        require(_price > 0, "Price can not be set to 0");
        require(_nftContract != address(0), "nft contract address can not be 0");

        //check if caller is owner of nft
        IERC721 nftContract = IERC721(_nftContract);
        address owner = nftContract.ownerOf(_tokenId);
        require(msg.sender == owner || msg.sender == nftContract.getApproved(_tokenId) || nftContract.isApprovedForAll(owner, msg.sender) , "You are not the owner");

        //list the NFT
        uint256 listingId = nextListingId;
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: _nftContract,
            price: _price,
            tokenId: _tokenId,
            isActive: true
        });
        nextListingId++;

        emit NFTListed(listingId, msg.sender, _nftContract, _tokenId, _price);

        return listingId;

    }

    function cancellListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];

        require(msg.sender == listing.seller, "You are not the seller");

        listing.isActive = false;

        emit NFTListingCalcelled(_listingId);

    }

    function buyNFT(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];

        require(listing.isActive, "NFTMarket: listing is not active");

        require(paymentToken.balanceOf(msg.sender) >= listing.price, "NFTMarket: Insufficient funds");

        require(msg.sender != listing.seller, "NFTMarket: caller is the seller");

        listing.isActive = false;

        bool success = paymentToken.transferFrom(msg.sender, listing.seller, listing.price);
        require(success, "NTFMarket: transfering tokens failed");

        IERC721(listing.nftContract).transferFrom(listing.seller, msg.sender, listing.tokenId);

        emit NFTSold(_listingId, listing.seller, msg.sender, listing.nftContract, listing.tokenId, listing.price);
    }


    function tokenReceived(address from, uint256 amount, bytes calldata data) external override returns(bool) {
        console.log("tokenReceived");
        
        require(msg.sender == address(paymentToken), "NFTMarket: caller is not the payment contract");
        require(data.length == 32, "NFTMarket: invalid data length");
        uint256 listingId = abi.decode(data, (uint256));
        console.log(listingId);
        

        Listing storage listing = listings[listingId];

        require(listing.isActive, "NFTMarket: listing is not active");
        
        console.log(listing.price == amount);
        require(amount == listing.price, "NFTMarket: invalid payment amount");
        console.log("not reverted");

        listing.isActive = false;

        bool success = paymentToken.transfer(listing.seller, amount);
        require(success, "NFTMarket: transfer tokens failed");

        IERC721(listing.nftContract).transferFrom(listing.seller, from, listing.tokenId);
        emit NFTSold(listingId, listing.seller, msg.sender, listing.nftContract, listing.tokenId, listing.price);


        return true;
    }
}
