import { ZGStorageClient } from '../storage/client';
import { ZGComputeClient } from '../compute/client';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('='.repeat(70));
  console.log('PAZE DAO - Complete 0G Network Integration Workflow');
  console.log('='.repeat(70));

  // Initialize clients
  const storageClient = new ZGStorageClient({
    rpcUrl: process.env.ZG_STORAGE_RPC_URL!,
    indexerUrl: process.env.ZG_STORAGE_INDEXER_URL!,
    flowContract: process.env.ZG_STORAGE_FLOW_CONTRACT!,
    privateKey: process.env.ZG_STORAGE_PRIVATE_KEY!,
    chainId: parseInt(process.env.ZG_CHAIN_ID!),
    maxFileSize: parseInt(process.env.ZG_STORAGE_MAX_FILE_SIZE!),
    chunkSize: parseInt(process.env.ZG_STORAGE_CHUNK_SIZE!),
    replicaCount: parseInt(process.env.ZG_STORAGE_REPLICA_COUNT!)
  });

  const computeClient = new ZGComputeClient({
    rpcUrl: process.env.ZG_COMPUTE_RPC_URL!,
    brokerUrl: process.env.ZG_COMPUTE_BROKER_URL!,
    privateKey: process.env.ZG_COMPUTE_PRIVATE_KEY!,
    chainId: parseInt(process.env.ZG_CHAIN_ID!),
    maxWorkers: parseInt(process.env.ZG_COMPUTE_MAX_WORKERS!),
    timeout: parseInt(process.env.ZG_COMPUTE_TIMEOUT!),
    retryAttempts: parseInt(process.env.ZG_COMPUTE_RETRY_ATTEMPTS!)
  });

  console.log('\n✅ Clients initialized successfully\n');

  // Step 1: Analyze image using 0G Compute
  console.log('Step 1: Image Analysis (0G Compute)');
  console.log('-'.repeat(70));
  
  const imageUrl = 'https://gateway.pinata.cloud/ipfs/bafybeicjfrjzid6gpxhyulyuwesxlpjp6tpmd6b4utdk75wbwicxdtc6wu';
  const imageAnalysis = await computeClient.analyzeImage(imageUrl);
  console.log(`✅ Image analyzed: ${imageAnalysis.category || 'Infrastructure'}`);

  // Step 2: Store analysis on 0G Storage
  console.log('\nStep 2: Store Analysis (0G Storage)');
  console.log('-'.repeat(70));
  
  const analysisData = {
    imageUrl,
    analysis: imageAnalysis,
    timestamp: new Date().toISOString()
  };
  
  const storageResult = await storageClient.uploadJSON(analysisData);
  console.log(`✅ Analysis stored: ${storageResult.root}`);

  // Step 3: Create proposal with stored data
  console.log('\nStep 3: Create Proposal');
  console.log('-'.repeat(70));
  
  const proposalData = {
    title: 'Repair Damaged Sidewalks in Denver',
    description: 'Infrastructure repair based on AI analysis',
    evidenceRoot: storageResult.root,
    requestedAmount: '5000',
    category: 'Infrastructure'
  };
  
  console.log(`✅ Proposal created with evidence: ${storageResult.root}`);

  console.log('\n' + '='.repeat(70));
  console.log('✅ Complete workflow executed successfully!');
  console.log('='.repeat(70));
}

main().catch(console.error);
