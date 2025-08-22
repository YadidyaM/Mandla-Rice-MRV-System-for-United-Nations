// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CarbonCredit
 * @dev Carbon Credit NFT contract for Mandla Rice MRV System
 * @author UN Climate Challenge 2024 - Team Mandla MRV
 */
contract CarbonCredit is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct CarbonCreditData {
        uint256 tokenId;
        address farmer;
        string farmId;
        uint256 emissionReduction; // in kg CO2e
        uint256 timestamp;
        string metadataURI; // IPFS hash for satellite data, MRV reports
        bool verified;
        bool retired;
        string verificationMethod; // "satellite", "field_visit", "hybrid"
    }
    
    struct Farm {
        string farmId;
        address farmer;
        uint256 totalCredits;
        uint256 totalRetired;
        bool active;
        string location; // GPS coordinates
        uint256 registrationDate;
    }
    
    // Mapping from token ID to carbon credit data
    mapping(uint256 => CarbonCreditData) public carbonCredits;
    
    // Mapping from farm ID to farm data
    mapping(string => Farm) public farms;
    
    // Mapping from farmer address to farm IDs
    mapping(address => string[]) public farmerFarms;
    
    // Events
    event CarbonCreditMinted(
        uint256 indexed tokenId,
        address indexed farmer,
        string indexed farmId,
        uint256 emissionReduction,
        string metadataURI
    );
    
    event CarbonCreditVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        string verificationMethod
    );
    
    event CarbonCreditRetired(
        uint256 indexed tokenId,
        address indexed retirer,
        string purpose
    );
    
    event FarmRegistered(
        string indexed farmId,
        address indexed farmer,
        string location
    );
    
    // Modifiers
    modifier onlyVerifiedCredit(uint256 tokenId) {
        require(carbonCredits[tokenId].verified, "Credit not verified");
        require(!carbonCredits[tokenId].retired, "Credit already retired");
        _;
    }
    
    modifier onlyFarmerOrOwner(string memory farmId) {
        require(
            farms[farmId].farmer == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new farm
     * @param farmId Unique identifier for the farm
     * @param location GPS coordinates or location description
     */
    function registerFarm(string memory farmId, string memory location) external {
        require(bytes(farmId).length > 0, "Farm ID cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(farms[farmId].farmer == address(0), "Farm already registered");
        
        farms[farmId] = Farm({
            farmId: farmId,
            farmer: msg.sender,
            totalCredits: 0,
            totalRetired: 0,
            active: true,
            location: location,
            registrationDate: block.timestamp
        });
        
        farmerFarms[msg.sender].push(farmId);
        
        emit FarmRegistered(farmId, msg.sender, location);
    }
    
    /**
     * @dev Mint a new carbon credit
     * @param farmId Farm identifier
     * @param emissionReduction Amount of CO2e reduced in kg
     * @param metadataURI IPFS hash containing satellite data and MRV reports
     */
    function mintCarbonCredit(
        string memory farmId,
        uint256 emissionReduction,
        string memory metadataURI
    ) external onlyFarmerOrOwner(farmId) {
        require(farms[farmId].active, "Farm not active");
        require(emissionReduction > 0, "Emission reduction must be positive");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        carbonCredits[newTokenId] = CarbonCreditData({
            tokenId: newTokenId,
            farmer: msg.sender,
            farmId: farmId,
            emissionReduction: emissionReduction,
            timestamp: block.timestamp,
            metadataURI: metadataURI,
            verified: false,
            retired: false,
            verificationMethod: ""
        });
        
        farms[farmId].totalCredits += emissionReduction;
        
        emit CarbonCreditMinted(
            newTokenId,
            msg.sender,
            farmId,
            emissionReduction,
            metadataURI
        );
    }
    
    /**
     * @dev Verify a carbon credit (only owner/verifiers)
     * @param tokenId Carbon credit token ID
     * @param verificationMethod Method used for verification
     */
    function verifyCarbonCredit(
        uint256 tokenId,
        string memory verificationMethod
    ) external onlyOwner {
        require(_tokenIds.current() >= tokenId, "Token does not exist");
        require(!carbonCredits[tokenId].verified, "Credit already verified");
        require(!carbonCredits[tokenId].retired, "Credit already retired");
        
        carbonCredits[tokenId].verified = true;
        carbonCredits[tokenId].verificationMethod = verificationMethod;
        
        emit CarbonCreditVerified(tokenId, msg.sender, verificationMethod);
    }
    
    /**
     * @dev Retire a carbon credit
     * @param tokenId Carbon credit token ID
     * @param purpose Purpose of retirement
     */
    function retireCarbonCredit(
        uint256 tokenId,
        string memory purpose
    ) external onlyVerifiedCredit(tokenId) {
        require(
            carbonCredits[tokenId].farmer == msg.sender || msg.sender == owner(),
            "Not authorized to retire"
        );
        
        carbonCredits[tokenId].retired = true;
        string memory farmId = carbonCredits[tokenId].farmId;
        farms[farmId].totalRetired += carbonCredits[tokenId].emissionReduction;
        
        emit CarbonCreditRetired(tokenId, msg.sender, purpose);
    }
    
    /**
     * @dev Get carbon credit data
     * @param tokenId Carbon credit token ID
     */
    function getCarbonCredit(uint256 tokenId) external view returns (CarbonCreditData memory) {
        require(_tokenIds.current() >= tokenId, "Token does not exist");
        return carbonCredits[tokenId];
    }
    
    /**
     * @dev Get farm data
     * @param farmId Farm identifier
     */
    function getFarm(string memory farmId) external view returns (Farm memory) {
        return farms[farmId];
    }
    
    /**
     * @dev Get farmer's farms
     * @param farmer Farmer address
     */
    function getFarmerFarms(address farmer) external view returns (string[] memory) {
        return farmerFarms[farmer];
    }
    
    /**
     * @dev Get total carbon credits minted
     */
    function totalCarbonCredits() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Get total emission reduction across all farms
     */
    function totalEmissionReduction() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (carbonCredits[i].verified && !carbonCredits[i].retired) {
                total += carbonCredits[i].emissionReduction;
            }
        }
        return total;
    }
}
