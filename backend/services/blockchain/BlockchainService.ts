import { ethers } from 'ethers';
import { logger } from '../../utils/logger';
import { config } from '../../config/config';

// Carbon Credit Token ABI (ERC-1155)
const CARBON_CREDIT_ABI = [
  // ERC-1155 Standard Functions
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
  
  // Carbon Credit Specific Functions
  'function mintCarbonCredit(address to, uint256 creditId, uint256 amount, string metadata)',
  'function burnCarbonCredit(address from, uint256 creditId, uint256 amount)',
  'function getCreditMetadata(uint256 creditId) view returns (string)',
  'function getCreditVerification(uint256 creditId) view returns (bool, uint256, string)',
  'function verifyCarbonCredit(uint256 creditId, string verificationHash)',
  'function retireCarbonCredit(uint256 creditId, uint256 amount, string retirementReason)',
  
  // Events
  'event CarbonCreditMinted(address indexed to, uint256 indexed creditId, uint256 amount, string metadata)',
  'event CarbonCreditBurned(address indexed from, uint256 indexed creditId, uint256 amount)',
  'event CarbonCreditVerified(uint256 indexed creditId, string verificationHash)',
  'event CarbonCreditRetired(uint256 indexed creditId, uint256 amount, string reason)',
  
  // View Functions
  'function totalSupply(uint256 id) view returns (uint256)',
  'function exists(uint256 id) view returns (bool)',
  'function getCreditType(uint256 creditId) view returns (uint8)',
  'function getCreditVintage(uint256 creditId) view returns (uint16)',
  'function getCreditLocation(uint256 creditId) view returns (string)',
  'function getCreditMethodology(uint256 creditId) view returns (string)'
];

// Escrow Contract ABI
const ESCROW_ABI = [
  'function createEscrow(uint256 transactionId, address seller, address buyer, uint256 amount) payable',
  'function releaseFunds(uint256 transactionId)',
  'function refundBuyer(uint256 transactionId)',
  'function getEscrowDetails(uint256 transactionId) view returns (address, address, uint256, bool, bool)',
  'function isEscrowActive(uint256 transactionId) view returns (bool)',
  
  // Events
  'event EscrowCreated(uint256 indexed transactionId, address indexed seller, address indexed buyer, uint256 amount)',
  'event FundsReleased(uint256 indexed transactionId, address indexed seller, uint256 amount)',
  'event BuyerRefunded(uint256 indexed transactionId, address indexed buyer, uint256 amount)'
];

export interface CarbonCreditMetadata {
  id: string;
  title: string;
  description: string;
  projectType: string;
  methodology: string;
  vintage: number;
  location: string;
  verificationLevel: string;
  quantity: number;
  pricePerCredit: number;
  currency: string;
  certification: string[];
  images: string[];
  documents: string[];
  farmId: string;
  farmerId: string;
  mrvReportHash: string;
  satelliteDataHash: string;
}

export interface TokenizationResult {
  success: boolean;
  transactionHash: string;
  creditId: string;
  tokenId: string;
  metadata: string;
  gasUsed: string;
  blockNumber: number;
}

export interface EscrowResult {
  success: boolean;
  escrowId: string;
  transactionHash: string;
  amount: string;
  gasUsed: string;
}

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private carbonCreditContract: ethers.Contract;
  private escrowContract: ethers.Contract;
  private isInitialized: boolean = false;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
    this.carbonCreditContract = new ethers.Contract(
      config.blockchain.carbonCreditContractAddress,
      CARBON_CREDIT_ABI,
      this.wallet
    );
    this.escrowContract = new ethers.Contract(
      config.blockchain.escrowContractAddress,
      ESCROW_ABI,
      this.wallet
    );
  }

  async initialize(): Promise<void> {
    try {
      // Check network connection
      const network = await this.provider.getNetwork();
      logger.info(`Connected to blockchain network: ${network.name} (Chain ID: ${network.chainId})`);

      // Check wallet balance
      const balance = await this.wallet.getBalance();
      logger.info(`Wallet balance: ${ethers.utils.formatEther(balance)} ETH`);

      // Check contract addresses
      const carbonCreditCode = await this.provider.getCode(config.blockchain.carbonCreditContractAddress);
      if (carbonCreditCode === '0x') {
        throw new Error('Carbon Credit contract not deployed at specified address');
      }

      const escrowCode = await this.provider.getCode(config.blockchain.escrowContractAddress);
      if (escrowCode === '0x') {
        throw new Error('Escrow contract not deployed at specified address');
      }

      this.isInitialized = true;
      logger.info('✅ Blockchain service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Tokenize carbon credits on the blockchain
   */
  async tokenizeCarbonCredit(metadata: CarbonCreditMetadata): Promise<TokenizationResult> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      logger.info(`Tokenizing carbon credit: ${metadata.id}`);

      // Generate unique credit ID
      const creditId = this.generateCreditId(metadata);
      
      // Prepare metadata for blockchain
      const blockchainMetadata = JSON.stringify({
        ...metadata,
        timestamp: Date.now(),
        blockchain: config.blockchain.networkName,
        version: '1.0'
      });

      // Estimate gas
      const gasEstimate = await this.carbonCreditContract.estimateGas.mintCarbonCredit(
        metadata.farmerId,
        creditId,
        metadata.quantity,
        blockchainMetadata
      );

      // Mint carbon credits
      const tx = await this.carbonCreditContract.mintCarbonCredit(
        metadata.farmerId,
        creditId,
        metadata.quantity,
        blockchainMetadata,
        {
          gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
        }
      );

      logger.info(`Transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      logger.info(`Carbon credit tokenized successfully: ${creditId}`);

      return {
        success: true,
        transactionHash: tx.hash,
        creditId: creditId,
        tokenId: creditId,
        metadata: blockchainMetadata,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      logger.error('Failed to tokenize carbon credit:', error);
      throw error;
    }
  }

  /**
   * Create escrow for carbon credit transaction
   */
  async createEscrow(
    transactionId: string,
    sellerAddress: string,
    buyerAddress: string,
    amount: number
  ): Promise<EscrowResult> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      logger.info(`Creating escrow for transaction: ${transactionId}`);

      const amountWei = ethers.utils.parseEther(amount.toString());

      // Estimate gas
      const gasEstimate = await this.escrowContract.estimateGas.createEscrow(
        transactionId,
        sellerAddress,
        buyerAddress,
        amountWei,
        {
          value: amountWei
        }
      );

      // Create escrow
      const tx = await this.escrowContract.createEscrow(
        transactionId,
        sellerAddress,
        buyerAddress,
        amountWei,
        {
          value: amountWei,
          gasLimit: gasEstimate.mul(120).div(100)
        }
      );

      logger.info(`Escrow transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      logger.info(`Escrow created successfully for transaction: ${transactionId}`);

      return {
        success: true,
        escrowId: transactionId,
        transactionHash: tx.hash,
        amount: amountWei.toString(),
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      logger.error('Failed to create escrow:', error);
      throw error;
    }
  }

  /**
   * Release funds from escrow to seller
   */
  async releaseEscrowFunds(transactionId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      logger.info(`Releasing escrow funds for transaction: ${transactionId}`);

      // Check escrow status
      const isActive = await this.escrowContract.isEscrowActive(transactionId);
      if (!isActive) {
        throw new Error('Escrow is not active');
      }

      // Estimate gas
      const gasEstimate = await this.escrowContract.estimateGas.releaseFunds(transactionId);

      // Release funds
      const tx = await this.escrowContract.releaseFunds(transactionId, {
        gasLimit: gasEstimate.mul(120).div(100)
      });

      logger.info(`Release transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();

      logger.info(`Escrow funds released successfully for transaction: ${transactionId}`);
      return true;

    } catch (error) {
      logger.error('Failed to release escrow funds:', error);
      throw error;
    }
  }

  /**
   * Refund buyer from escrow
   */
  async refundBuyer(transactionId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      logger.info(`Refunding buyer for transaction: ${transactionId}`);

      // Check escrow status
      const isActive = await this.escrowContract.isEscrowActive(transactionId);
      if (!isActive) {
        throw new Error('Escrow is not active');
      }

      // Estimate gas
      const gasEstimate = await this.escrowContract.estimateGas.refundBuyer(transactionId);

      // Refund buyer
      const tx = await this.escrowContract.refundBuyer(transactionId, {
        gasLimit: gasEstimate.mul(120).div(100)
      });

      logger.info(`Refund transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();

      logger.info(`Buyer refunded successfully for transaction: ${transactionId}`);
      return true;

    } catch (error) {
      logger.error('Failed to refund buyer:', error);
      throw error;
    }
  }

  /**
   * Verify carbon credit on blockchain
   */
  async verifyCarbonCredit(creditId: string, verificationHash: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      logger.info(`Verifying carbon credit: ${creditId}`);

      // Estimate gas
      const gasEstimate = await this.carbonCreditContract.estimateGas.verifyCarbonCredit(
        creditId,
        verificationHash
      );

      // Verify credit
      const tx = await this.carbonCreditContract.verifyCarbonCredit(
        creditId,
        verificationHash,
        {
          gasLimit: gasEstimate.mul(120).div(100)
        }
      );

      logger.info(`Verification transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();

      logger.info(`Carbon credit verified successfully: ${creditId}`);
      return true;

    } catch (error) {
      logger.error('Failed to verify carbon credit:', error);
      throw error;
    }
  }

  /**
   * Retire carbon credits (permanent removal from circulation)
   */
  async retireCarbonCredit(
    creditId: string,
    amount: number,
    retirementReason: string
  ): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      logger.info(`Retiring carbon credits: ${creditId}, amount: ${amount}`);

      // Estimate gas
      const gasEstimate = await this.carbonCreditContract.estimateGas.retireCarbonCredit(
        creditId,
        amount,
        retirementReason
      );

      // Retire credits
      const tx = await this.carbonCreditContract.retireCarbonCredit(
        creditId,
        amount,
        retirementReason,
        {
          gasLimit: gasEstimate.mul(120).div(100)
        }
      );

      logger.info(`Retirement transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();

      logger.info(`Carbon credits retired successfully: ${creditId}`);
      return true;

    } catch (error) {
      logger.error('Failed to retire carbon credits:', error);
      throw error;
    }
  }

  /**
   * Get carbon credit balance for an address
   */
  async getCreditBalance(address: string, creditId: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const balance = await this.carbonCreditContract.balanceOf(address, creditId);
      return balance.toNumber();
    } catch (error) {
      logger.error('Failed to get credit balance:', error);
      throw error;
    }
  }

  /**
   * Get carbon credit metadata from blockchain
   */
  async getCreditMetadata(creditId: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const metadata = await this.carbonCreditContract.getCreditMetadata(creditId);
      return metadata;
    } catch (error) {
      logger.error('Failed to get credit metadata:', error);
      throw error;
    }
  }

  /**
   * Get escrow details from blockchain
   */
  async getEscrowDetails(transactionId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const details = await this.escrowContract.getEscrowDetails(transactionId);
      return {
        seller: details[0],
        buyer: details[1],
        amount: ethers.utils.formatEther(details[2]),
        isActive: details[3],
        isCompleted: details[4]
      };
    } catch (error) {
      logger.error('Failed to get escrow details:', error);
      throw error;
    }
  }

  /**
   * Generate unique credit ID for blockchain
   */
  private generateCreditId(metadata: CarbonCreditMetadata): string {
    const input = `${metadata.farmId}-${metadata.vintage}-${metadata.projectType}-${Date.now()}`;
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(input));
    return hash;
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<any> {
    try {
      const network = await this.provider.getNetwork();
      const latestBlock = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();

      return {
        name: network.name,
        chainId: network.chainId,
        latestBlock,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
      };
    } catch (error) {
      logger.error('Failed to get network info:', error);
      throw error;
    }
  }

  /**
   * Get wallet information
   */
  async getWalletInfo(): Promise<any> {
    try {
      const address = this.wallet.address;
      const balance = await this.wallet.getBalance();
      const nonce = await this.wallet.getTransactionCount();

      return {
        address,
        balance: ethers.utils.formatEther(balance),
        nonce
      };
    } catch (error) {
      logger.error('Failed to get wallet info:', error);
      throw error;
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}
