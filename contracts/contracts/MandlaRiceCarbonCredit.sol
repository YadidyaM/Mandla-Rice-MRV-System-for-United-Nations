// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MandlaRiceCarbonCredit
 * @dev ERC1155 token contract for Mandla Rice carbon credits
 * @notice This contract manages carbon credits generated from sustainable rice farming in Mandla, MP
 * 
 * Features:
 * - ERC1155 multi-token standard for different credit types
 * - Role-based access control for minting and management
 * - Pausable for emergency stops
 * - Batch operations for efficiency
 * - Retirement/offsetting functionality
 * - Transparent metadata and provenance tracking
 */
contract MandlaRiceCarbonCredit is ERC1155, AccessControl, Pausable, ReentrancyGuard {
    using Strings for uint256;

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant BATCH_MANAGER_ROLE = keccak256("BATCH_MANAGER_ROLE");

    // Credit metadata structure
    struct CreditMetadata {
        uint256 quantity;           // Total quantity in hundredths of tCO2e (e.g., 100 = 1 tCO2e)
        uint256 vintage;           // Year of emission reduction
        string methodology;        // IPCC methodology used
        string farmId;            // Reference to farm
        string seasonId;          // Reference to farming season
        string mrvReportHash;     // IPFS hash of MRV report
        address farmer;           // Original farmer wallet
        uint256 mintedAt;         // Timestamp of minting
        bool isRetired;           // Whether credit has been retired
        string retiredBy;         // Entity that retired the credit
        uint256 retiredAt;        // Timestamp of retirement
    }

    // Batch metadata for aggregated credits
    struct BatchMetadata {
        uint256[] tokenIds;       // Token IDs in this batch
        uint256 totalQuantity;    // Total tCO2e in batch
        uint256 averageVintage;   // Weighted average vintage
        string batchNumber;       // Human-readable batch identifier
        uint256 createdAt;        // Timestamp of batch creation
        bool isListed;           // Whether batch is listed for sale
        uint256 pricePerTonne;   // Price per tCO2e in wei
        address seller;          // Current seller
    }

    // Storage
    mapping(uint256 => CreditMetadata) public creditMetadata;
    mapping(uint256 => BatchMetadata) public batchMetadata;
    mapping(address => uint256[]) public farmerTokens;
    mapping(string => uint256) public farmSeasonToToken; // farmId_seasonId => tokenId
    
    uint256 private _currentTokenId;
    uint256 private _currentBatchId;
    
    // Contract metadata
    string public name = "Mandla Rice Carbon Credit";
    string public symbol = "MRCC";
    string public version = "1.0.0";
    string private _baseTokenURI;

    // Events
    event CreditMinted(
        uint256 indexed tokenId,
        address indexed farmer,
        uint256 quantity,
        string farmId,
        string seasonId,
        string mrvReportHash
    );
    
    event CreditRetired(
        uint256 indexed tokenId,
        uint256 quantity,
        string retiredBy,
        address indexed retirer
    );
    
    event BatchCreated(
        uint256 indexed batchId,
        uint256[] tokenIds,
        uint256 totalQuantity,
        string batchNumber
    );
    
    event BatchListed(
        uint256 indexed batchId,
        uint256 pricePerTonne,
        address indexed seller
    );

    event BatchSold(
        uint256 indexed batchId,
        address indexed buyer,
        address indexed seller,
        uint256 totalPrice
    );

    // Errors
    error TokenNotFound();
    error BatchNotFound();
    error InsufficientBalance();
    error AlreadyRetired();
    error UnauthorizedOperation();
    error InvalidQuantity();
    error InvalidPrice();
    error BatchNotListed();
    error InsufficientPayment();

    /**
     * @dev Constructor
     * @param _uri Base URI for token metadata
     * @param _admin Admin address for roles
     */
    constructor(
        string memory _uri,
        address _admin
    ) ERC1155(_uri) {
        _baseTokenURI = _uri;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(VERIFIER_ROLE, _admin);
        _grantRole(BATCH_MANAGER_ROLE, _admin);
        _currentTokenId = 1;
        _currentBatchId = 1;
    }

    /**
     * @dev Mint new carbon credits
     * @param farmer Address of the farmer
     * @param quantity Quantity in hundredths of tCO2e
     * @param vintage Year of emission reduction
     * @param methodology IPCC methodology used
     * @param farmId Farm identifier
     * @param seasonId Season identifier
     * @param mrvReportHash IPFS hash of MRV report
     */
    function mintCredit(
        address farmer,
        uint256 quantity,
        uint256 vintage,
        string memory methodology,
        string memory farmId,
        string memory seasonId,
        string memory mrvReportHash
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        if (quantity == 0) revert InvalidQuantity();
        if (farmer == address(0)) revert UnauthorizedOperation();
        
        uint256 tokenId = _currentTokenId++;
        string memory farmSeasonKey = string(abi.encodePacked(farmId, "_", seasonId));
        
        // Ensure no duplicate minting for same farm-season
        if (farmSeasonToToken[farmSeasonKey] != 0) {
            revert UnauthorizedOperation();
        }
        
        // Store metadata
        creditMetadata[tokenId] = CreditMetadata({
            quantity: quantity,
            vintage: vintage,
            methodology: methodology,
            farmId: farmId,
            seasonId: seasonId,
            mrvReportHash: mrvReportHash,
            farmer: farmer,
            mintedAt: block.timestamp,
            isRetired: false,
            retiredBy: "",
            retiredAt: 0
        });
        
        farmSeasonToToken[farmSeasonKey] = tokenId;
        farmerTokens[farmer].push(tokenId);
        
        // Mint the token
        _mint(farmer, tokenId, quantity, "");
        
        emit CreditMinted(tokenId, farmer, quantity, farmId, seasonId, mrvReportHash);
        
        return tokenId;
    }

    /**
     * @dev Retire carbon credits (burn for offset)
     * @param tokenId Token ID to retire
     * @param quantity Quantity to retire
     * @param retiredBy Entity retiring the credits
     */
    function retireCredit(
        uint256 tokenId,
        uint256 quantity,
        string memory retiredBy
    ) external nonReentrant {
        if (creditMetadata[tokenId].mintedAt == 0) revert TokenNotFound();
        if (creditMetadata[tokenId].isRetired) revert AlreadyRetired();
        if (balanceOf(msg.sender, tokenId) < quantity) revert InsufficientBalance();
        if (quantity == 0) revert InvalidQuantity();
        
        // Burn the tokens
        _burn(msg.sender, tokenId, quantity);
        
        // Update metadata if fully retired
        if (balanceOf(msg.sender, tokenId) == 0 && totalSupply(tokenId) == 0) {
            creditMetadata[tokenId].isRetired = true;
            creditMetadata[tokenId].retiredBy = retiredBy;
            creditMetadata[tokenId].retiredAt = block.timestamp;
        }
        
        emit CreditRetired(tokenId, quantity, retiredBy, msg.sender);
    }

    /**
     * @dev Create a batch of credits for trading
     * @param tokenIds Array of token IDs to batch
     * @param quantities Quantities of each token to include
     * @param batchNumber Human-readable batch identifier
     */
    function createBatch(
        uint256[] memory tokenIds,
        uint256[] memory quantities,
        string memory batchNumber
    ) external onlyRole(BATCH_MANAGER_ROLE) returns (uint256) {
        if (tokenIds.length != quantities.length) revert InvalidQuantity();
        if (tokenIds.length == 0) revert InvalidQuantity();
        
        uint256 batchId = _currentBatchId++;
        uint256 totalQuantity = 0;
        uint256 weightedVintageSum = 0;
        
        // Validate tokens and calculate totals
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            uint256 quantity = quantities[i];
            
            if (creditMetadata[tokenId].mintedAt == 0) revert TokenNotFound();
            if (creditMetadata[tokenId].isRetired) revert AlreadyRetired();
            
            totalQuantity += quantity;
            weightedVintageSum += creditMetadata[tokenId].vintage * quantity;
        }
        
        uint256 averageVintage = weightedVintageSum / totalQuantity;
        
        // Store batch metadata
        batchMetadata[batchId] = BatchMetadata({
            tokenIds: tokenIds,
            totalQuantity: totalQuantity,
            averageVintage: averageVintage,
            batchNumber: batchNumber,
            createdAt: block.timestamp,
            isListed: false,
            pricePerTonne: 0,
            seller: address(0)
        });
        
        emit BatchCreated(batchId, tokenIds, totalQuantity, batchNumber);
        
        return batchId;
    }

    /**
     * @dev List a batch for sale
     * @param batchId Batch ID to list
     * @param pricePerTonne Price per tCO2e in wei
     */
    function listBatch(uint256 batchId, uint256 pricePerTonne) external {
        if (batchMetadata[batchId].createdAt == 0) revert BatchNotFound();
        if (pricePerTonne == 0) revert InvalidPrice();
        
        BatchMetadata storage batch = batchMetadata[batchId];
        
        // Verify seller owns all tokens in batch
        for (uint256 i = 0; i < batch.tokenIds.length; i++) {
            uint256 tokenId = batch.tokenIds[i];
            if (balanceOf(msg.sender, tokenId) == 0) revert InsufficientBalance();
        }
        
        batch.isListed = true;
        batch.pricePerTonne = pricePerTonne;
        batch.seller = msg.sender;
        
        emit BatchListed(batchId, pricePerTonne, msg.sender);
    }

    /**
     * @dev Buy a listed batch
     * @param batchId Batch ID to purchase
     */
    function buyBatch(uint256 batchId) external payable nonReentrant {
        if (batchMetadata[batchId].createdAt == 0) revert BatchNotFound();
        
        BatchMetadata storage batch = batchMetadata[batchId];
        
        if (!batch.isListed) revert BatchNotListed();
        
        uint256 totalPrice = (batch.totalQuantity * batch.pricePerTonne) / 100; // Convert from hundredths
        if (msg.value < totalPrice) revert InsufficientPayment();
        
        address seller = batch.seller;
        
        // Transfer all tokens in batch
        for (uint256 i = 0; i < batch.tokenIds.length; i++) {
            uint256 tokenId = batch.tokenIds[i];
            uint256 balance = balanceOf(seller, tokenId);
            if (balance > 0) {
                _safeTransferFrom(seller, msg.sender, tokenId, balance, "");
            }
        }
        
        // Mark batch as sold
        batch.isListed = false;
        batch.seller = address(0);
        batch.pricePerTonne = 0;
        
        // Transfer payment
        (bool success, ) = payable(seller).call{value: totalPrice}("");
        require(success, "Payment transfer failed");
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit BatchSold(batchId, msg.sender, seller, totalPrice);
    }

    /**
     * @dev Get token URI for metadata
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        if (creditMetadata[tokenId].mintedAt == 0) revert TokenNotFound();
        
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    /**
     * @dev Get total supply of a token
     */
    function totalSupply(uint256 tokenId) public view returns (uint256) {
        return creditMetadata[tokenId].quantity;
    }

    /**
     * @dev Get farmer's token IDs
     */
    function getFarmerTokens(address farmer) external view returns (uint256[] memory) {
        return farmerTokens[farmer];
    }

    /**
     * @dev Get batch token IDs
     */
    function getBatchTokens(uint256 batchId) external view returns (uint256[] memory) {
        return batchMetadata[batchId].tokenIds;
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Update base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
    }

    // The following functions are overrides required by Solidity
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Hook function for token transfers - removed due to OpenZeppelin version compatibility
}
