import { ZGComputeClient } from '../compute/client';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('='.repeat(60));
  console.log('0G Compute Integration Example');
  console.log('='.repeat(60));

  // Initialize client
  const client = new ZGComputeClient({
    rpcUrl: process.env.ZG_COMPUTE_RPC_URL!,
    brokerUrl: process.env.ZG_COMPUTE_BROKER_URL!,
    privateKey: process.env.ZG_COMPUTE_PRIVATE_KEY!,
    chainId: parseInt(process.env.ZG_CHAIN_ID!),
    maxWorkers: parseInt(process.env.ZG_COMPUTE_MAX_WORKERS!),
    timeout: parseInt(process.env.ZG_COMPUTE_TIMEOUT!),
    retryAttempts: parseInt(process.env.ZG_COMPUTE_RETRY_ATTEMPTS!)
  });

  // Example 1: Image Analysis
  console.log('\n🖼️  Example 1: Image Analysis');
  console.log('-'.repeat(60));

  const imageUrl = 'https://gateway.pinata.cloud/ipfs/bafybeicjfrjzid6gpxhyulyuwesxlpjp6tpmd6b4utdk75wbwicxdtc6wu';
  const imageAnalysis = await client.analyzeImage(imageUrl);
  
  console.log('✅ Image analysis complete!');
  console.log(`   Objects detected: ${imageAnalysis.objects?.length || 0}`);
  console.log(`   Confidence: ${imageAnalysis.confidence || 'N/A'}%`);
  console.log(`   Category: ${imageAnalysis.category || 'N/A'}`);

  // Example 2: Text Analysis
  console.log('\n📝 Example 2: Text Analysis');
  console.log('-'.repeat(60));

  const proposalText = `
    This proposal requests funding to repair damaged sidewalks in Denver's 
    Golden Triangle area. The current conditions pose safety hazards for 
    pedestrians and impact local infrastructure.
  `;

  const textAnalysis = await client.analyzeText(proposalText);
  
  console.log('✅ Text analysis complete!');
  console.log(`   Sentiment: ${textAnalysis.sentiment || 'N/A'}`);
  console.log(`   Key topics: ${textAnalysis.topics?.join(', ') || 'N/A'}`);
  console.log(`   Urgency score: ${textAnalysis.urgency || 'N/A'}`);

  // Example 3: Impact Prediction
  console.log('\n🎯 Example 3: Impact Prediction');
  console.log('-'.repeat(60));

  const proposalData = {
    title: 'Repair Damaged Sidewalks',
    category: 'Infrastructure',
    location: 'Denver, Colorado',
    requestedAmount: 5000,
    affectedPopulation: 5000,
    urgency: 'medium'
  };

  const impactPrediction = await client.predictImpact(proposalData);
  
  console.log('✅ Impact prediction complete!');
  console.log(`   Impact score: ${impactPrediction.score || 'N/A'}/100`);
  console.log(`   Success probability: ${impactPrediction.successProbability || 'N/A'}%`);
  console.log(`   Estimated timeline: ${impactPrediction.timeline || 'N/A'} days`);

  // Example 4: Proposal Validation
  console.log('\n✔️  Example 4: Proposal Validation');
  console.log('-'.repeat(60));

  const validation = await client.validateProposal(proposalData);
  
  console.log('✅ Validation complete!');
  console.log(`   Valid: ${validation.isValid ? 'Yes' : 'No'}`);
  console.log(`   Completeness: ${validation.completeness || 'N/A'}%`);
  console.log(`   Issues: ${validation.issues?.length || 0}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All examples completed successfully!');
  console.log('='.repeat(60));
}

main().catch(console.error);
