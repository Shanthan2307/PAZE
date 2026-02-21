import { ethers } from 'ethers';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🔍 Retrieving Past Proposals from DAO...\n');

  const provider = new ethers.JsonRpcProvider(process.env.ADI_TESTNET_RPC);
  const daoAddress = process.env.DAO_CONTRACT_ADDRESS || '0x21C986a1C0e8658D9C5efe4bFcd9A120e49bedaB';
  
  const daoABI = [
    "function getProposal(bytes32 proposalId) external view returns (string memory description, uint256 forVotes, uint256 againstVotes, uint256 deadline, bool executed, bool exists)",
    "event ProposalCreated(bytes32 indexed proposalId, string description, uint256 deadline)"
  ];

  const dao = new ethers.Contract(daoAddress, daoABI, provider);

  // Get ProposalCreated events
  console.log('Fetching ProposalCreated events...');
  
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks
  
  const filter = dao.filters.ProposalCreated();
  const events = await dao.queryFilter(filter, fromBlock, currentBlock);
  
  console.log(`Found ${events.length} proposals\n`);

  const proposals = [];

  for (const event of events) {
    if (!('args' in event)) continue;
    
    const proposalId = event.args[0];
    const description = event.args[1];
    const deadline = event.args[2];
    
    try {
      const proposal = await dao.getProposal(proposalId);
      
      const proposalData = {
        id: proposalId,
        description: description,
        forVotes: proposal.forVotes.toString(),
        againstVotes: proposal.againstVotes.toString(),
        deadline: new Date(Number(deadline) * 1000).toISOString(),
        executed: proposal.executed,
        exists: proposal.exists,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash
      };
      
      proposals.push(proposalData);
      
      console.log(`📋 Proposal ${proposals.length}`);
      console.log(`   ID: ${proposalId}`);
      console.log(`   Executed: ${proposalData.executed}`);
      console.log(`   Votes For: ${proposalData.forVotes}`);
      console.log(`   Votes Against: ${proposalData.againstVotes}`);
      console.log(`   Deadline: ${proposalData.deadline}`);
      console.log(`   Description: ${description.substring(0, 100)}...`);
      console.log();
    } catch (error) {
      console.log(`   ⚠️  Could not fetch details for ${proposalId}`);
      console.log(`   Error: ${error}`);
    }
  }

  // Save to file
  const showcase = {
    contract: daoAddress,
    network: 'ADI Testnet',
    chainId: 99999,
    retrievedAt: new Date().toISOString(),
    totalProposals: proposals.length,
    proposals: proposals
  };

  fs.writeFileSync(
    'PROPOSALS_SHOWCASE.json',
    JSON.stringify(showcase, null, 2)
  );

  console.log('='.repeat(60));
  console.log('✅ Proposals Retrieved!');
  console.log('='.repeat(60));
  console.log(`Total Proposals: ${proposals.length}`);
  console.log(`Saved to: PROPOSALS_SHOWCASE.json`);
  console.log(`\n🌐 View Contract:`);
  console.log(`https://explorer.ab.testnet.adifoundation.ai/address/${daoAddress}`);
  console.log('='.repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
