// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.7;

contract EbayChain {
    //allow seller to create auctions
    //allow buys make offer for an auctions
    //allow seller and buyers to trade at the end of an auction
    //create some getter functions for auctions and offers

    struct Auction {
        uint id;
        address payable seller;
        string name;
        string description;
        uint minPrice;
        uint endDate;
        uint bestOfferId;
        uint[] offerIds;
    }

    struct Offer{
        uint id;
        uint auctionId;
        address payable buyer;
        uint price;
    }

    mapping (uint => Auction) private auctions;
    mapping(uint => Offer) private offers;
    mapping(address => uint[]) private userAuctions;
    mapping(address => uint[]) private userOffers;
    uint private nextAuctionId = 1;
    uint private nextOfferId =1;


    constructor() {
        
    }

    function createAuction(string calldata _name,
        string calldata _description,
        uint _minPrice,
        uint _duration) external {
        uint[] memory offerIds = new uint [](0);
        require(_minPrice > 0 , "Min must be greater than 0");
        require(_duration > 86400 && _duration < 864000, "Duration must be comprised between 1 to 10 days");
        auctions[nextAuctionId] = Auction(nextAuctionId, payable(msg.sender),  _name, _description, _minPrice, block.timestamp + _duration, 0, offerIds);
        userAuctions[msg.sender].push(nextAuctionId);
        nextAuctionId ++;
    }

    function createOffer(uint _auctionId) auctionExists(_auctionId) external payable{
        Auction storage auction = auctions[_auctionId];
        Offer storage bestOffer = offers[auction.bestOfferId];
        require(block.timestamp < auction.endDate, "Auction has expired") ;
        require(msg.value >= auction.minPrice && msg.value > bestOffer.price, "msg.value must be superior to min and bestOffer");
        auction.bestOfferId = nextOfferId;
        auction.offerIds.push(nextOfferId);
        offers[nextOfferId] = Offer(nextOfferId, _auctionId, payable(msg.sender), msg.value);
        userOffers[msg.sender].push(nextOfferId);
        nextOfferId ++;
    }

    function trade(uint _auctionId) external auctionExists(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        Offer storage bestOffer = offers[auction.bestOfferId];
        require(block.timestamp > auction.endDate, "Auction is still active");
        for(uint i = 0; i < auction.offerIds.length; i++){
            uint offerId = auction.offerIds[i];
            if (offerId != auction.bestOfferId){
                Offer storage offer  = offers[offerId];
                offer.buyer.transfer(offer.price);
            }
        }
        payable(auction.seller).transfer(bestOffer.price);
    }

    function getAuctions() external view returns (Auction[] memory){
        Auction[] memory _auctions = new Auction[](nextAuctionId - 1);
        for(uint i = 1; i < nextAuctionId ; i++){
            _auctions[i-1] = auctions[i];
        }
        return _auctions;
    }

    function getUserAuctions(address _user) view external returns(Auction[] memory){
        uint[] storage userAuctionIds = userAuctions[_user];
        Auction[] memory _auctions = new Auction[](userAuctionIds.length);
        for(uint i = 0 ; i< userAuctionIds.length; i++){
            uint auctionId = userAuctionIds[i];
            _auctions[i] = auctions[auctionId];
        }
        return _auctions;
    }

    function getUserOffers(address _user) view external returns(Offer[] memory){
        uint[] storage userOfferIds = userOffers[_user];
        Offer[] memory _offers = new Offer[](userOfferIds.length);
        for(uint i = 0 ; i< userOfferIds.length; i++){
            uint offerId = userOfferIds[i];
            _offers[i] = offers[offerId];
        }
        return _offers;
    }

    function getOffer(uint _offerId) view external returns(Offer memory){
        return offers[_offerId];
    }

    modifier auctionExists(uint _auctionId) {
        require(_auctionId > 0 && _auctionId < nextAuctionId, "Auction does not exist");
        _;
    }


}