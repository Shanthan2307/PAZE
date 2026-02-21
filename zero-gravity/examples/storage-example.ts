import { ZGStorageClient } from '../storage/client';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function main() {
  console.log('='.repeat(60));
  console.log('0G Storage Integration Example');
  console.log('='.repeat(60));

  // Initialize client
  const client = new ZGStorageClient({
    rpcUrl: process.env.ZG_STORAGE_RPC_URL!,
    indexerUrl: process.env.ZG_STORAGE_INDEXER_URL!,
    flowContract: process.env.ZG_STORAGE_FLOW_CONTRACT!,
    privateKey: process.env.ZG_STORAGE_PRIVATE_KEY!,
    chainId: parseInt(process.env.ZG_CHAIN_ID!),
    maxFileSize: parseInt(process.env.ZG_STORAGE_MAX_FILE_SIZE!),
    chunkSize: parseInt(process.env.ZG_STORAGE_CHUNK_SIZE!),
    replicaCount: parseInt(process.env.ZG_STORAGE_REPLICA_COUNT!)
  });

  // Example 1: Upload proposal data
  console.log('\n📤 Example 1: Uploading Proposal Data');
  console.log('-'.repeat(60));

  const proposalData = {
    title: 'Repair Damaged Sidewalks in Denver',
    description: 'Infrastructure repair proposal for Golden Triangle area',
    location: 'Denver, Colorado',
    coordinates: { lat: 39.7392, lng: -104.9903 },
    requestedAmount: '5000',
    category: 'Infrastructure',
    urgency: 'medium',
    evidence: {
      images: ['ipfs://...'],
      reports: ['ipfs://...']
    },
    timestamp: new Date().toISOString()
  };

  const uploadResult = await client.uploadJSON(proposalData);
  console.log('✅ Upload successful!');
  console.log(`   Root: ${uploadResult.root}`);
  console.log(`   TX: ${uploadResult.txHash}`);
  console.log(`   URL: ${uploadResult.url}`);
  console.log(`   Size: ${uploadResult.size} bytes`);

  // Example 2: Download and verify
  console.log('\n📥 Example 2: Downloading and Verifying Data');
  console.log('-'.repeat(60));

  const downloadedData = await client.downloadJSON(uploadResult.root);
  console.log('✅ Download successful!');
  console.log(`   Title: ${downloadedData.title}`);
  console.log(`   Location: ${downloadedData.location}`);

  // Example 3: Get metadata
  console.log('\n📊 Example 3: Fetching Metadata');
  console.log('-'.repeat(60));

  const metadata = await client.getFileMetadata(uploadResult.root);
  console.log('✅ Metadata retrieved!');
  console.log(`   Replicas: ${metadata.replicas || 'N/A'}`);
  console.log(`   Status: ${metadata.status || 'Available'}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All examples completed successfully!');
  console.log('='.repeat(60));
}

main().catch(console.error);
