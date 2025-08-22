/**
 * IPFS Service for decentralized storage
 */

import pinataSDK from '@pinata/sdk';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

export class IPFSService {
  private pinata: any;

  constructor() {
    this.pinata = new pinataSDK(config.ipfs.pinataApiKey, config.ipfs.pinataSecretKey);
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      const options = {
        pinataMetadata: {
          name: `MRV-Report-${Date.now()}`,
          keyvalues: {
            type: 'mrv-report',
            timestamp: new Date().toISOString()
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      };

      const result = await this.pinata.pinJSONToIPFS(data, options);
      logger.info('Data uploaded to IPFS', { hash: result.IpfsHash });
      
      return result.IpfsHash;
    } catch (error) {
      logger.error('Failed to upload to IPFS:', error);
      throw error;
    }
  }

  async uploadFile(fileBuffer: Buffer, filename: string): Promise<string> {
    try {
      const options = {
        pinataMetadata: {
          name: filename,
          keyvalues: {
            type: 'file',
            timestamp: new Date().toISOString()
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      };

      const result = await this.pinata.pinFileToIPFS(fileBuffer, options);
      logger.info('File uploaded to IPFS', { hash: result.IpfsHash, filename });
      
      return result.IpfsHash;
    } catch (error) {
      logger.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  async retrieveData(hash: string): Promise<any> {
    try {
      // Note: Pinata doesn't provide direct retrieval API
      // In production, you would retrieve from IPFS gateway
      const gatewayUrl = `${config.ipfs.gatewayUrl}${hash}`;
      
      // This is a mock implementation
      return { gatewayUrl, hash };
    } catch (error) {
      logger.error('Failed to retrieve from IPFS:', error);
      throw error;
    }
  }

  async signData(data: any): Promise<string> {
    try {
      // Create a hash of the data for signing
      const dataString = JSON.stringify(data);
      const hash = crypto.createHash('sha256').update(dataString).digest('hex');
      
      // In a real implementation, this would use a proper cryptographic signature
      // For demo purposes, we'll create a simple signature
      const signature = crypto.createHmac('sha256', 'undp-mrv-secret-key')
        .update(hash)
        .digest('hex');
      
      return `0x${signature}`;
    } catch (error) {
      logger.error('Failed to sign data:', error);
      throw error;
    }
  }

  async verifySignature(data: any, signature: string): Promise<boolean> {
    try {
      const expectedSignature = await this.signData(data);
      return expectedSignature === signature;
    } catch (error) {
      logger.error('Failed to verify signature:', error);
      return false;
    }
  }
}
