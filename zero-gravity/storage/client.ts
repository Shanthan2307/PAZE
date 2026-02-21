import { ethers } from 'ethers';
import axios from 'axios';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface ZGStorageConfig {
  rpcUrl: string;
  indexerUrl: string;
  flowContract: string;
  privateKey: string;
  chainId: number;
  maxFileSize: number;
  chunkSize: number;
  replicaCount: number;
}

export interface UploadResult {
  root: string;
  txHash: string;
  url: string;
  size: number;
  timestamp: number;
}

export class ZGStorageClient {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private config: ZGStorageConfig;

  constructor(config: ZGStorageConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
  }

  /**
   * Upload file to 0G Storage
   */
  async uploadFile(filePath: string): Promise<UploadResult> {
    console.log(`[0G Storage] Uploading file: ${filePath}`);

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;

    if (fileSize > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum: ${this.config.maxFileSize}`);
    }

    // Calculate merkle root
    const merkleRoot = this.calculateMerkleRoot(fileBuffer);
    console.log(`[0G Storage] Merkle root: ${merkleRoot}`);

    // Submit to flow contract
    const tx = await this.submitToFlow(merkleRoot, fileSize);
    console.log(`[0G Storage] Flow submission tx: ${tx.hash}`);
    await tx.wait();

    // Upload chunks to storage nodes
    await this.uploadChunks(fileBuffer, merkleRoot);

    const result: UploadResult = {
      root: merkleRoot,
      txHash: tx.hash,
      url: `${this.config.indexerUrl}/download/${merkleRoot}`,
      size: fileSize,
      timestamp: Date.now()
    };

    console.log(`[0G Storage] Upload complete: ${result.url}`);
    return result;
  }

  /**
   * Upload JSON data to 0G Storage
   */
  async uploadJSON(data: any): Promise<UploadResult> {
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    const tempFile = `/tmp/0g-upload-${Date.now()}.json`;
    fs.writeFileSync(tempFile, buffer);
    
    try {
      const result = await this.uploadFile(tempFile);
      fs.unlinkSync(tempFile);
      return result;
    } catch (error) {
      fs.unlinkSync(tempFile);
      throw error;
    }
  }

  /**
   * Download file from 0G Storage
   */
  async downloadFile(merkleRoot: string): Promise<Buffer> {
    console.log(`[0G Storage] Downloading file: ${merkleRoot}`);
    
    const url = `${this.config.indexerUrl}/download/${merkleRoot}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    return Buffer.from(response.data);
  }

  /**
   * Download and parse JSON from 0G Storage
   */
  async downloadJSON(merkleRoot: string): Promise<any> {
    const buffer = await this.downloadFile(merkleRoot);
    return JSON.parse(buffer.toString('utf-8'));
  }

  /**
   * Verify file integrity
   */
  async verifyFile(merkleRoot: string, fileBuffer: Buffer): Promise<boolean> {
    const calculatedRoot = this.calculateMerkleRoot(fileBuffer);
    return calculatedRoot === merkleRoot;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(merkleRoot: string): Promise<any> {
    const url = `${this.config.indexerUrl}/metadata/${merkleRoot}`;
    const response = await axios.get(url);
    return response.data;
  }

  /**
   * Calculate merkle root for file
   */
  private calculateMerkleRoot(buffer: Buffer): string {
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return '0x' + hash.digest('hex');
  }

  /**
   * Submit file to flow contract
   */
  private async submitToFlow(merkleRoot: string, fileSize: number): Promise<any> {
    const flowABI = [
      'function submit(bytes32 root, uint256 size) external returns (uint256)'
    ];
    
    const flowContract = new ethers.Contract(
      this.config.flowContract,
      flowABI,
      this.wallet
    );

    return await flowContract.submit(merkleRoot, fileSize);
  }

  /**
   * Upload file chunks to storage nodes
   */
  private async uploadChunks(buffer: Buffer, merkleRoot: string): Promise<void> {
    const chunks = this.splitIntoChunks(buffer);
    console.log(`[0G Storage] Uploading ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      await this.uploadChunk(chunks[i], i, merkleRoot);
    }
  }

  /**
   * Split buffer into chunks
   */
  private splitIntoChunks(buffer: Buffer): Buffer[] {
    const chunks: Buffer[] = [];
    let offset = 0;

    while (offset < buffer.length) {
      const end = Math.min(offset + this.config.chunkSize, buffer.length);
      chunks.push(buffer.slice(offset, end));
      offset = end;
    }

    return chunks;
  }

  /**
   * Upload single chunk
   */
  private async uploadChunk(chunk: Buffer, index: number, merkleRoot: string): Promise<void> {
    const url = `${this.config.indexerUrl}/upload`;
    
    await axios.post(url, {
      root: merkleRoot,
      index,
      data: chunk.toString('base64')
    });
  }
}
