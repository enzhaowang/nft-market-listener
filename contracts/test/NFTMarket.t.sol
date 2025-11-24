// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {NFTMarket} from "../src/NFTMarket.sol";
import {MyERC20} from "../src/MyERC20.sol";
import {MyNFT} from "../src/MyNFT.sol";

contract NFTMarketTest is Test {
    NFTMarket public nftMarket;
    MyERC20 public paymentToken;
    MyNFT public myNFT;

    address public seller = address(0x123);
    address public buyer  = address(0x456);
    string public tokenURI =
        "ipfs://bafkreihgyyx4a5qsi4fxotxmqitngegzobmplmwzz4durcdkp3fokd6j24";

    // 事件要和合约里的一模一样
    event NFTListed(
        uint256 indexed listingId,
        address seller,
        address nftContract,
        uint256 tokenId,
        uint256 price
    );
    event TokenReceived(
        uint256 indexed listingId,
        address seller,
        address buyer,
        address nftContract,
        uint256 tokenId,
        uint256 price
    );
    event BuyNFT(
        uint256 indexed listingId,
        address seller,
        address buyer,
        address nftContract,
        uint256 tokenId,
        uint256 price
    );
    event NFTListingCancelled(uint256 indexed listingId);

    function setUp() public {
        // MyERC20 构造函数里给 msg.sender 铸初始量
        paymentToken = new MyERC20(1_000_000 ether);
        nftMarket = new NFTMarket(address(paymentToken));
        myNFT = new MyNFT();

        // 给 seller 铸一个 NFT 用来卖
        vm.prank(seller);
        myNFT.mintNFT(seller, tokenURI);
    }

    /*//////////////////////////////////////////////////////////////
                           LIST 功能测试
    //////////////////////////////////////////////////////////////*/

    function test_ListNFT_Success() public {
        uint256 price = 100;

        // seller 授权 market 可以转走 NFT
        vm.prank(seller);
        myNFT.approve(address(nftMarket), 0);

        // 预期事件
        vm.expectEmit(true, true, false, true);
        emit NFTListed(0, seller, address(myNFT), 0, price);

        // 真正调用
        vm.prank(seller);
        uint256 listingId = nftMarket.list(address(myNFT), price, 0);

        assertEq(listingId, 0);

        (
            address lSeller,
            address lNft,
            uint256 lTokenId,
            uint256 lPrice,
            bool isActive
        ) = nftMarket.listings(listingId);

        assertEq(lSeller, seller);
        assertEq(lNft, address(myNFT));
        assertEq(lTokenId, 0);
        assertEq(lPrice, price);
        assertTrue(isActive);
    }

    function test_ListNFT_Revert_PriceZero() public {
        vm.prank(seller);
        myNFT.approve(address(nftMarket), 0);

        vm.expectRevert("Price can not be set to 0");
        vm.prank(seller);
        nftMarket.list(address(myNFT), 0, 0);
    }

    function test_ListNFT_Revert_NftAddressZero() public {
        vm.expectRevert("nft contract address can not be 0");
        vm.prank(seller);
        nftMarket.list(address(0), 100, 0);
    }

    function test_ListNFT_Revert_NotOwnerOrApproved() public {
        // buyer 不是 owner，也没有被 approve
        vm.expectRevert("You are not the owner");
        vm.prank(buyer);
        nftMarket.list(address(myNFT), 100, 0);
    }

    /*//////////////////////////////////////////////////////////////
                         Cancel Listing 测试
    //////////////////////////////////////////////////////////////*/

    function _createListing(uint256 price) internal returns (uint256) {
        vm.prank(seller);
        myNFT.approve(address(nftMarket), 0);

        vm.prank(seller);
        uint256 listingId = nftMarket.list(address(myNFT), price, 0);

        return listingId;
    }

    function test_CancelListing_Success() public {
        uint256 listingId = _createListing(100);

        vm.expectEmit(true, false, false, false);
        emit NFTListingCancelled(listingId);

        vm.prank(seller);
        nftMarket.cancellListing(listingId);

        (, , , , bool isActive) = nftMarket.listings(listingId);
        assertFalse(isActive);
    }

    function test_CancelListing_Revert_NotSeller() public {
        uint256 listingId = _createListing(100);

        vm.prank(buyer);
        vm.expectRevert("You are not the seller");
        nftMarket.cancellListing(listingId);
    }

    /*//////////////////////////////////////////////////////////////
                         buyNFT (transferFrom) 测试
    //////////////////////////////////////////////////////////////*/

    function test_BuyNFT_Success_UsingBuyNFT() public {
        uint256 price = 100;

        uint256 listingId = _createListing(price);

        // 给 buyer 发 ERC20
        deal(address(paymentToken), buyer, 200);
        vm.prank(buyer);
        paymentToken.approve(address(nftMarket), 200);

        uint256 sellerBalanceBefore = paymentToken.balanceOf(seller);
        uint256 buyerBalanceBefore = paymentToken.balanceOf(buyer);

        vm.expectEmit(true, true, true, true);
        emit BuyNFT(listingId, seller, buyer, address(myNFT), 0, price);

        vm.prank(buyer);
        nftMarket.buyNFT(listingId);

        // listing inactive
        (, , , , bool isActive) = nftMarket.listings(listingId);
        assertFalse(isActive);

        // 余额变化
        assertEq(
            paymentToken.balanceOf(seller),
            sellerBalanceBefore + price
        );
        assertEq(
            paymentToken.balanceOf(buyer),
            buyerBalanceBefore - price
        );

        // NFT 归 buyer
        assertEq(myNFT.ownerOf(0), buyer);
    }

    function test_BuySelfNFT_Revert() public {
        uint256 listingId = _createListing(100);

        // seller 自己买自己的 NFT
        deal(address(paymentToken), seller, 200);
        vm.prank(seller);
        paymentToken.approve(address(nftMarket), 200);

        vm.prank(seller);
        vm.expectRevert("NFTMarket: caller is the seller");
        nftMarket.buyNFT(listingId);
    }

    function test_BuyNFT_Revert_Inactive() public {
        uint256 listingId = _createListing(100);

        // 先取消 listing
        vm.prank(seller);
        nftMarket.cancellListing(listingId);

        deal(address(paymentToken), buyer, 200);
        vm.prank(buyer);
        paymentToken.approve(address(nftMarket), 200);

        vm.prank(buyer);
        vm.expectRevert("NFTMarket: listing is not active");
        nftMarket.buyNFT(listingId);
    }

    function test_BuyNFT_Revert_InsufficientFunds() public {
        uint256 price = 100;
        uint256 listingId = _createListing(price);

        // buyer 只有 50 < 100
        deal(address(paymentToken), buyer, 50);
        vm.prank(buyer);
        paymentToken.approve(address(nftMarket), 50);

        vm.prank(buyer);
        vm.expectRevert("NFTMarket: Insufficient funds");
        nftMarket.buyNFT(listingId);
    }

    /*//////////////////////////////////////////////////////////////
                 tokenReceived + transferWithCallback 测试
    //////////////////////////////////////////////////////////////*/

    /// 使用 ERC20 的 callback 流程买 NFT，走 tokenReceived()
    function test_BuyNFT_UsingTokenReceived_Success() public {
        uint256 price = 100;
        uint256 listingId = _createListing(price);

        // 这里假设 paymentToken 实现了 transferWithCallbackAndData
        deal(address(paymentToken), buyer, 200);

        bytes memory data = abi.encode(listingId);

        uint256 sellerBalanceBefore = paymentToken.balanceOf(seller);
        uint256 buyerBalanceBefore = paymentToken.balanceOf(buyer);

        // 注意：你的合约里 TokenReceived 事件的 buyer 字段是 msg.sender（即 paymentToken）
        // 所以这里我们不去严格 check buyer 字段，避免和语义冲突
        vm.expectEmit(true, true, false, true);
        emit TokenReceived(
            listingId,
            seller,
            address(paymentToken), // 实际上是 msg.sender
            address(myNFT),
            0,
            price
        );

        vm.prank(buyer);
        paymentToken.transferWithCallbackAndData(
            address(nftMarket),
            price,
            data
        );

        // listing inactive
        (, , , , bool isActive) = nftMarket.listings(listingId);
        assertFalse(isActive);

        // 余额变化：market 最终应该不持有 token
        assertEq(
            paymentToken.balanceOf(seller),
            sellerBalanceBefore + price
        );
        assertEq(
            paymentToken.balanceOf(buyer),
            buyerBalanceBefore - price
        );
        assertEq(paymentToken.balanceOf(address(nftMarket)), 0);

        // NFT owner = buyer
        assertEq(myNFT.ownerOf(0), buyer);
    }

    function test_TokenReceived_Revert_WrongCaller() public {
        uint256 price = 100;
        uint256 listingId = _createListing(price);

        bytes memory data = abi.encode(listingId);

        // 直接用 prank，假装一个不是 paymentToken 的合约来调
        vm.expectRevert("NFTMarket: caller is not the payment contract");
        nftMarket.tokenReceived(buyer, price, data);
    }

    function test_TokenReceived_Revert_InvalidAmount() public {
        uint256 price = 100;
        uint256 listingId = _createListing(price);

        deal(address(paymentToken), buyer, 200);
        bytes memory data = abi.encode(listingId);

        // amount != listing.price，会在 tokenReceived 里 revert
        vm.prank(buyer);
        vm.expectRevert("NFTMarket: invalid payment amount");
        paymentToken.transferWithCallbackAndData(
            address(nftMarket),
            price + 1,
            data
        );
    }

    function test_TokenReceived_Revert_InvalidDataLength() public {
        uint256 price = 100;
        uint256 listingId = _createListing(price);

        deal(address(paymentToken), buyer, 200);

        // data 长度不是 32
        bytes memory badData = abi.encode(uint256(listingId), uint256(123));

        vm.prank(buyer);
        vm.expectRevert("NFTMarket: invalid data length");
        paymentToken.transferWithCallbackAndData(
            address(nftMarket),
            price,
            badData
        );
    }

    /*//////////////////////////////////////////////////////////////
                              Fuzz 测试
    //////////////////////////////////////////////////////////////*/

    function testFuzz_ListAndBuyNFT_UsingBuyNFT(uint256 price, address fuzzBuyer) public {
        vm.assume(price > 0 && price <= 1_000_000);
        vm.assume(fuzzBuyer != address(0) && fuzzBuyer != seller);

        // 确保 seller 有 NFT
        // setUp 里已经给 seller mint tokenId = 0 并且是 ownerOf(0)
        vm.prank(seller);
        myNFT.approve(address(nftMarket), 0);
        vm.prank(seller);
        uint256 listingId = nftMarket.list(address(myNFT), price, 0);

        // 给 fuzzBuyer 钱
        deal(address(paymentToken), fuzzBuyer, price + 1);
        vm.prank(fuzzBuyer);
        paymentToken.approve(address(nftMarket), price + 1);

        vm.expectEmit(true, true, true, true);
        emit BuyNFT(listingId, seller, fuzzBuyer, address(myNFT), 0, price);

        vm.prank(fuzzBuyer);
        nftMarket.buyNFT(listingId);

        assertEq(myNFT.ownerOf(0), fuzzBuyer);
    }

    /*//////////////////////////////////////////////////////////////
                          Invariant 测试
    //////////////////////////////////////////////////////////////*/

    /// Market 最终不应该长期持有支付 token（tokenReceived 会立即转给 seller）
    function invariant_marketAlwaysZeroBalance() public {
        assertEq(
            paymentToken.balanceOf(address(nftMarket)),
            0,
            "Market contract should never hold payment tokens"
        );
    }
}
