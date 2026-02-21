/**
 * Test script for 0G Compute enhancement
 * 
 * This script demonstrates how the 0G Compute integration enhances
 * photo analysis with AI-generated taglines.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AnalysisEnhancer } from '../tg_analysis/enhance-analysis-with-0g';
import { ZGComputeConfig } from '../zero-gravity/compute/tagline-generator';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  console.log('🧪 Testing 0G Compute Enhancement\n');

  // Check configuration
  console.log('📋 Configuration:');
  console.log(`  RPC URL: ${process.env.ZG_COMPUTE_RPC_URL || 'https://evmrpc-testnet.0g.ai (default)'}`);
  console.log(`  Private Key: ${process.env.ZG_COMPUTE_PRIVATE_KEY || process.env.PRIVATE_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`  Model: qwen-2.5-7b-instruct (0G testnet free model)`);
  console.log();

  if (!process.env.ZG_COMPUTE_PRIVATE_KEY && !process.env.PRIVATE_KEY) {
    console.log('⚠️  0G Compute private key not configured');
    console.log('   Add ZG_COMPUTE_PRIVATE_KEY or PRIVATE_KEY to your .env file');
    console.log('   Use your own EVM wallet private key');
    console.log();
    console.log('   For testing, the system will use fallback tagline generation');
    console.log();
  }

  // Find a sample analysis file
  const detailsDir = path.join(__dirname, '..', 'details', 'analysis');
  const files = await fs.readdir(detailsDir);
  const analysisFiles = files.filter(f => f.startsWith('analysis-') && f.endsWith('.json'));

  if (analysisFiles.length === 0) {
    console.log('❌ No analysis files found in details/analysis/');
    console.log('   Please run the photo analysis first');
    return;
  }

  const sampleFile = path.join(detailsDir, analysisFiles[0]);
  console.log(`📄 Using sample analysis: ${analysisFiles[0]}\n`);

  // Read the original analysis
  const originalContent = await fs.readFile(sampleFile, 'utf-8');
  const originalData = JSON.parse(originalContent);

  console.log('📊 Original Analysis:');
  console.log(`  Location: ${originalData.metadata?.location?.city}, ${originalData.metadata?.location?.state}`);
  console.log(`  Description: ${originalData.analysis?.description?.substring(0, 100)}...`);
  console.log(`  Impact Score: ${originalData.impactAssessment?.score}`);
  console.log();

  // Initialize enhancer
  const config: ZGComputeConfig = {
    privateKey: process.env.ZG_COMPUTE_PRIVATE_KEY || process.env.PRIVATE_KEY || '',
    rpcUrl: process.env.ZG_COMPUTE_RPC_URL || 'https://evmrpc-testnet.0g.ai',
    model: 'qwen-2.5-7b-instruct'
  };

  const enhancer = new AnalysisEnhancer(config);

  console.log('⚡ Enhancing with 0G Compute...');
  console.log('   This may take 10-30 seconds...\n');

  try {
    const result = await enhancer.enhanceAnalysis(sampleFile);

    if (result.success) {
      console.log('✅ Enhancement successful!\n');
      console.log('🎯 Generated Tagline:');
      console.log(`   "${result.tagline}"\n`);
      console.log('📊 0G Compute Metadata:');
      console.log(`   Model: ${result.zgComputeMetadata?.model}`);
      console.log(`   Execution Time: ${result.zgComputeMetadata?.executionTime}ms`);
      console.log(`   Provider Address: ${result.zgComputeMetadata?.providerAddress}\n`);
      console.log(`💾 Enhanced analysis saved to:`);
      console.log(`   ${result.enhancedAnalysisPath}\n`);

      // Show the enhanced analysis structure
      const enhancedContent = await fs.readFile(result.enhancedAnalysisPath!, 'utf-8');
      const enhancedData = JSON.parse(enhancedContent);

      console.log('📋 Enhanced Analysis Structure:');
      console.log(JSON.stringify(enhancedData.zgComputeEnhancement, null, 2));
      console.log();

      console.log('🎉 Test completed successfully!');
      console.log();
      console.log('Next steps:');
      console.log('  1. The enhanced analysis includes the 0G-generated tagline');
      console.log('  2. This will be automatically used when creating DAO proposals');
      console.log('  3. Check the frontend 0G tab to see transaction history');
    } else {
      console.log('❌ Enhancement failed:');
      console.log(`   ${result.error}\n`);
      
      if (!config.privateKey) {
        console.log('💡 Mock Mode Available:');
        console.log('   Since 0G Compute is not configured, you can test with mock data');
        console.log('   The system will work without 0G enhancement in production');
      }
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error();
    
    if (!config.privateKey) {
      console.log('💡 To enable 0G Compute:');
      console.log('   1. Get a 0G testnet account');
      console.log('   2. Add ZG_COMPUTE_PRIVATE_KEY to .env');
      console.log('   3. Run this test again');
    }
  }
}

main().catch(console.error);
